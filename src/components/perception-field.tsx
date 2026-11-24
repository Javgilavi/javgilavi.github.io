"use client";

import { useEffect, useRef } from "react";

type Pt = { x: number; y: number; a: number; r: number; band: number; obj: number; dx: number; dy: number };
type Obj = {
  cx: number;
  cy: number;
  w: number;
  h: number;
  label: string;
  conf: number;
  phase: number;
  amp: number;
  trail: { x: number; y: number }[];
  x: number;
  y: number;
  a: number;
};

const LABELS = ["person", "robot_arm", "chair", "box", "bottle", "table"];
const TAU = Math.PI * 2;
const BANDS = 6;

type Palette = { near: number[]; far: number[]; lit: string; ink: number; wedge: number };

const PALETTES: Record<"dark" | "light", Palette> = {
  // near → far: teal → indigo; `ink` scales alpha so the light canvas gets the same presence
  dark: { near: [94, 234, 212], far: [129, 140, 248], lit: "94, 234, 212", ink: 1, wedge: 0.11 },
  light: { near: [13, 148, 128], far: [79, 70, 229], lit: "13, 148, 128", ink: 1.55, wedge: 0.06 },
};

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(", ");

/**
 * A LiDAR-style point field: scan rings around a sensor below the canvas, a sweeping beam
 * with a glowing wedge and afterglow, range-coloured points, sonar pings, and a few tracked
 * objects that drift, leave a track and get a labelled box when the beam passes. Points
 * part around the cursor.
 */
export function PerceptionField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0,
      h = 0,
      ox = 0,
      oy = 0,
      dpr = 1,
      maxR = 1;
    let pts: Pt[] = [];
    let objs: Obj[] = [];
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999 };
    let pal = PALETTES.dark;
    let bandColors: string[] = [];

    const readColors = () => {
      pal = document.documentElement.classList.contains("dark") ? PALETTES.dark : PALETTES.light;
      bandColors = Array.from({ length: BANDS }, (_, i) => `rgb(${mix(pal.near, pal.far, i / (BANDS - 1))})`);
    };

    // deterministic pseudo-random so the layout is stable between resizes
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const narrow = w < 768;
      ox = narrow ? w * 0.5 : w * 0.72;
      oy = h * 1.08;
      seed = 7;

      pts = [];
      objs = [];
      maxR = Math.hypot(Math.max(ox, w - ox), oy) * 1.02;
      // scan rings get sparser with distance, like a real spinning LiDAR
      let r = 40;
      let ring = 0;
      while (r < maxR) {
        const spacing = 7 + ring * 0.35;
        const n = Math.floor((TAU * r) / spacing);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU + rand() * 0.004;
          const rr = r + (rand() - 0.5) * 2.2;
          const x = ox + Math.cos(a) * rr;
          const y = oy + Math.sin(a) * rr;
          if (x < -4 || x > w + 4 || y < -4 || y > h + 4) continue;
          const band = Math.min(BANDS - 1, Math.floor((rr / maxR) * BANDS));
          pts.push({ x, y, a: (a + TAU) % TAU, r: rr, band, obj: -1, dx: 0, dy: 0 });
        }
        r *= 1.075;
        ring++;
      }

      // tracked objects: dense clusters on the right, away from the hero text
      // (on phones, in the empty band above the text)
      const count = narrow ? 3 : 5;
      for (let k = 0; k < count; k++) {
        const cx = narrow ? w * (0.14 + (k / count) * 0.72 + rand() * 0.06) : w * (0.6 + (k / count) * 0.32 + rand() * 0.04);
        const cy = narrow ? h * (0.13 + rand() * 0.05) : h * (0.2 + rand() * 0.55);
        const bw = 26 + rand() * 46;
        const bh = 22 + rand() * 56;
        objs.push({
          cx,
          cy,
          w: bw,
          h: bh,
          label: LABELS[k % LABELS.length],
          conf: 0.78 + rand() * 0.2,
          phase: rand() * TAU,
          amp: narrow ? 8 + rand() * 10 : 14 + rand() * 22,
          trail: [],
          x: cx,
          y: cy,
          a: 0,
        });
        const n = Math.floor((bw * bh) / 34);
        for (let i = 0; i < n; i++) {
          pts.push({ x: (rand() - 0.5) * bw, y: (rand() - 0.5) * bh, a: 0, r: 0, band: 0, obj: k, dx: 0, dy: 0 });
        }
      }
    };

    const angleTo = (x: number, y: number) => (Math.atan2(y - oy, x - ox) + TAU) % TAU;

    const start = performance.now();
    let lastSweep = Math.PI;
    let lastTrail = 0;

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      // the beam oscillates across the visible upper half-plane
      const sweep = reduce ? Math.PI * 1.45 : Math.PI + (Math.PI * (1 - Math.cos(t * 0.42))) / 2;
      const dir = sweep >= lastSweep ? 1 : -1;
      lastSweep = sweep;
      const ink = pal.ink;
      ctx.clearRect(0, 0, w, h);

      // move tracked objects along slow Lissajous paths and record their track
      for (const o of objs) {
        o.x = o.cx + (reduce ? 0 : Math.sin(t * 0.35 + o.phase) * o.amp);
        o.y = o.cy + (reduce ? 0 : Math.sin(t * 0.22 + o.phase * 1.7) * o.amp * 0.45);
        o.a = angleTo(o.x, o.y);
      }
      if (!reduce && t - lastTrail > 0.12) {
        lastTrail = t;
        for (const o of objs) {
          o.trail.push({ x: o.x, y: o.y });
          if (o.trail.length > 26) o.trail.shift();
        }
      }

      // glowing wedge behind the beam
      const wedge = 0.55;
      if (typeof ctx.createConicGradient === "function") {
        const from = dir > 0 ? sweep - wedge : sweep;
        const g = ctx.createConicGradient(from, ox, oy);
        const a0 = dir > 0 ? 0 : pal.wedge;
        const a1 = dir > 0 ? pal.wedge : 0;
        g.addColorStop(0, `rgba(${pal.lit}, ${a0})`);
        g.addColorStop(wedge / TAU, `rgba(${pal.lit}, ${a1})`);
        g.addColorStop(wedge / TAU + 0.0001, `rgba(${pal.lit}, 0)`);
        g.addColorStop(1, `rgba(${pal.lit}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.arc(ox, oy, maxR, from, from + wedge);
        ctx.closePath();
        ctx.fill();
      }

      // sonar pings expanding from the sensor
      if (!reduce) {
        for (let k = 0; k < 2; k++) {
          const p = ((t / 3.2 + k / 2) % 1 + 1) % 1;
          ctx.strokeStyle = `rgba(${pal.lit}, ${(1 - p) * 0.22 * ink})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ox, oy, 40 + p * maxR, Math.PI, TAU);
          ctx.stroke();
        }
      }

      // points: afterglow behind the beam, sharp leading edge, range colour, cursor repulsion
      const lit: { x: number; y: number; s: number; al: number }[] = [];
      const byBand: { x: number; y: number; s: number; al: number }[][] = Array.from({ length: BANDS }, () => []);
      for (const p of pts) {
        let x: number, y: number, a: number;
        if (p.obj >= 0) {
          const o = objs[p.obj];
          x = o.x + p.x;
          y = o.y + p.y;
          a = o.a;
        } else {
          x = p.x;
          y = p.y;
          a = p.a;
        }
        let d = (sweep - a) * dir; // > 0: the beam has already passed this point
        if (d > Math.PI) d -= TAU;
        if (d < -Math.PI) d += TAU;
        const glow = d >= 0 ? Math.exp(-d * 3.2) : Math.exp(d * 26);

        const mx = x - mouse.x;
        const my = y - mouse.y;
        const md = Math.hypot(mx, my);
        const hover = md < 150 ? (1 - md / 150) ** 2 : 0;
        // ease towards the pushed-away position so the field "parts" smoothly
        const tx = hover > 0 ? (mx / (md || 1)) * hover * 14 : 0;
        const ty = hover > 0 ? (my / (md || 1)) * hover * 14 : 0;
        p.dx += (tx - p.dx) * 0.15;
        p.dy += (ty - p.dy) * 0.15;
        x += p.dx;
        y += p.dy;

        const isObj = p.obj >= 0;
        const base = isObj ? 0.3 : 0.16;
        const al = Math.min(1, (base + glow * (isObj ? 0.85 : 0.62) + hover * 0.6) * ink);
        const s = isObj ? 1.7 : 1.15 + glow * 0.5 + hover * 0.8;
        if (isObj || glow > 0.3 || hover > 0.25) lit.push({ x, y, s, al });
        else byBand[p.band].push({ x, y, s, al });
      }
      for (let b = 0; b < BANDS; b++) {
        ctx.fillStyle = bandColors[b];
        for (const q of byBand[b]) {
          ctx.globalAlpha = q.al;
          ctx.fillRect(q.x - q.s / 2, q.y - q.s / 2, q.s, q.s);
        }
      }
      ctx.fillStyle = `rgb(${pal.lit})`;
      for (const q of lit) {
        ctx.globalAlpha = q.al;
        ctx.fillRect(q.x - q.s / 2, q.y - q.s / 2, q.s, q.s);
      }
      ctx.globalAlpha = 1;

      // the beam itself
      const len = Math.hypot(w, h) * 1.2;
      const ex = ox + Math.cos(sweep) * len;
      const ey = oy + Math.sin(sweep) * len;
      const grad = ctx.createLinearGradient(ox, oy, ex, ey);
      grad.addColorStop(0, `rgba(${pal.lit}, ${0.55 * Math.min(ink, 1.2)})`);
      grad.addColorStop(1, `rgba(${pal.lit}, 0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // tracks + boxes: visible after the beam passes, fading out over a few seconds
      ctx.font = "500 10px var(--font-geist-mono), ui-monospace, monospace";
      for (const o of objs) {
        let d = (sweep - o.a) * dir;
        if (d > Math.PI) d -= TAU;
        if (d < -Math.PI) d += TAU;
        const k = reduce ? 0.85 : d >= 0 ? Math.exp(-d * 1.6) : Math.exp(d * 18);
        if (k < 0.04) continue;

        // dotted track of where the object has been
        if (o.trail.length > 1) {
          for (let i = 0; i < o.trail.length; i += 2) {
            const q = o.trail[i];
            ctx.fillStyle = `rgba(${pal.lit}, ${(i / o.trail.length) * 0.5 * k * ink})`;
            ctx.fillRect(q.x - 1, q.y - 1, 2, 2);
          }
        }

        const x = o.x - o.w / 2 - 4;
        const y = o.y - o.h / 2 - 4;
        const bw = o.w + 8;
        const bh = o.h + 8;
        const c = 7;
        ctx.strokeStyle = `rgba(${pal.lit}, ${Math.min(1, 0.85 * k * ink)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y + c); ctx.lineTo(x, y); ctx.lineTo(x + c, y);
        ctx.moveTo(x + bw - c, y); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw, y + c);
        ctx.moveTo(x + bw, y + bh - c); ctx.lineTo(x + bw, y + bh); ctx.lineTo(x + bw - c, y + bh);
        ctx.moveTo(x + c, y + bh); ctx.lineTo(x, y + bh); ctx.lineTo(x, y + bh - c);
        ctx.stroke();
        // faint fill so the box reads as a detection
        ctx.fillStyle = `rgba(${pal.lit}, ${0.05 * k * ink})`;
        ctx.fillRect(x, y, bw, bh);

        // label chip with the class, confidence and a confidence bar
        const text = `${o.label} ${o.conf.toFixed(2)}`;
        const tw = ctx.measureText(text).width;
        ctx.fillStyle = `rgba(${pal.lit}, ${Math.min(1, 0.9 * k * ink)})`;
        ctx.fillText(text, x, y - 7);
        ctx.fillStyle = `rgba(${pal.lit}, ${0.18 * k * ink})`;
        ctx.fillRect(x, y - 4, tw, 1.5);
        ctx.fillStyle = `rgba(${pal.lit}, ${0.8 * k * ink})`;
        ctx.fillRect(x, y - 4, tw * o.conf, 1.5);
      }

      // the sensor, pulsing just inside the bottom edge
      if (oy - h < 60) {
        const pulse = reduce ? 0.5 : (Math.sin(t * 3) + 1) / 2;
        ctx.fillStyle = `rgba(${pal.lit}, ${0.5 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(ox, Math.min(oy, h - 3), 3, 0, TAU);
        ctx.fill();
      }

      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      if (reduce) draw(performance.now());
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };

    readColors();
    build();
    draw(performance.now());

    const ro = new ResizeObserver(() => {
      build();
      if (reduce || !visible) draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting && !document.hidden;
      if (visible && !was && !reduce) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);

    const mo = new MutationObserver(() => {
      readColors();
      if (reduce) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
