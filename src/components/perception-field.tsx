"use client";

import { useEffect, useRef } from "react";

type Pt = { x: number; y: number; a: number; r: number; obj: number };
type Obj = { cx: number; cy: number; w: number; h: number; a: number; label: string };

const LABELS = ["person 0.94", "chair 0.88", "robot_arm 0.91", "box 0.83", "bottle 0.79", "table 0.86"];
const TAU = Math.PI * 2;

/**
 * A LiDAR-style point field: concentric scan rings around a sensor at the bottom of the
 * canvas, a rotating sweep that lights points up, and a few "detected" objects that get a
 * bounding box and a label when the sweep passes. Points also react to the cursor.
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
      dpr = 1;
    let pts: Pt[] = [];
    let objs: Obj[] = [];
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999 };
    let brand = "45, 212, 191";
    let fg = "200, 205, 215";
    let boost = 1;

    const readColors = () => {
      const dark = document.documentElement.classList.contains("dark");
      brand = dark ? "94, 234, 212" : "13, 148, 128";
      fg = dark ? "190, 196, 210" : "60, 72, 92";
      // a light canvas needs more ink for the same presence
      boost = dark ? 1 : 1.7;
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
      ox = w * 0.72;
      oy = h * 1.08;
      seed = 7;

      pts = [];
      objs = [];
      const maxR = Math.hypot(Math.max(ox, w - ox), oy) * 1.02;
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
          pts.push({ x, y, a: (a + TAU) % TAU, r: rr, obj: -1 });
        }
        r *= 1.075;
        ring++;
      }

      // detected objects: dense clusters with a bounding box
      // keep objects on the right, away from the hero text (or near the bottom on phones)
      const narrow = w < 768;
      const count = narrow ? 3 : 5;
      for (let k = 0; k < count; k++) {
        const cx = narrow ? w * (0.15 + rand() * 0.7) : w * (0.6 + (k / count) * 0.32 + rand() * 0.04);
        const cy = narrow ? h * (0.8 + rand() * 0.06) : h * (0.2 + rand() * 0.55);
        const bw = 26 + rand() * 46;
        const bh = 22 + rand() * 56;
        const a = (Math.atan2(cy - oy, cx - ox) + TAU) % TAU;
        objs.push({ cx, cy, w: bw, h: bh, a, label: LABELS[k % LABELS.length] });
        const n = Math.floor((bw * bh) / 38);
        for (let i = 0; i < n; i++) {
          const x = cx + (rand() - 0.5) * bw;
          const y = cy + (rand() - 0.5) * bh;
          pts.push({ x, y, a: (Math.atan2(y - oy, x - ox) + TAU) % TAU, r: Math.hypot(x - ox, y - oy), obj: k });
        }
      }
    };

    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      // sweep oscillates across the visible upper half-plane
      const sweep = reduce ? Math.PI * 1.45 : Math.PI + (Math.PI * (1 - Math.cos(t * 0.42))) / 2;
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        let d = Math.abs(sweep - p.a);
        if (d > Math.PI) d = TAU - d;
        const lit = Math.exp(-d * 7);
        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const hover = md < 140 ? (1 - md / 140) ** 2 : 0;
        const base = p.obj >= 0 ? 0.28 : 0.14;
        const alpha = Math.min(1, (base + lit * (p.obj >= 0 ? 0.9 : 0.6) + hover * 0.7) * boost);
        const s = p.obj >= 0 ? 1.6 : 1.2 + hover * 0.8;
        ctx.fillStyle = lit > 0.25 || hover > 0.2 || p.obj >= 0 ? `rgba(${brand}, ${alpha})` : `rgba(${fg}, ${alpha})`;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }

      // sweep beam
      const len = Math.hypot(w, h) * 1.2;
      const grad = ctx.createLinearGradient(ox, oy, ox + Math.cos(sweep) * len, oy + Math.sin(sweep) * len);
      grad.addColorStop(0, `rgba(${brand}, 0.35)`);
      grad.addColorStop(1, `rgba(${brand}, 0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(sweep) * len, oy + Math.sin(sweep) * len);
      ctx.stroke();

      // bounding boxes fade in when the sweep passes the object and linger
      ctx.font = "500 10px var(--font-geist-mono), ui-monospace, monospace";
      for (const o of objs) {
        let d = Math.abs(sweep - o.a);
        if (d > Math.PI) d = TAU - d;
        const k = reduce ? 0.8 : Math.exp(-d * 3.2);
        if (k < 0.04) continue;
        const x = o.cx - o.w / 2 - 4;
        const y = o.cy - o.h / 2 - 4;
        ctx.strokeStyle = `rgba(${brand}, ${0.75 * k})`;
        ctx.lineWidth = 1;
        const c = 6;
        // corner brackets
        ctx.beginPath();
        ctx.moveTo(x, y + c); ctx.lineTo(x, y); ctx.lineTo(x + c, y);
        ctx.moveTo(x + o.w + 8 - c, y); ctx.lineTo(x + o.w + 8, y); ctx.lineTo(x + o.w + 8, y + c);
        ctx.moveTo(x + o.w + 8, y + o.h + 8 - c); ctx.lineTo(x + o.w + 8, y + o.h + 8); ctx.lineTo(x + o.w + 8 - c, y + o.h + 8);
        ctx.moveTo(x + c, y + o.h + 8); ctx.lineTo(x, y + o.h + 8); ctx.lineTo(x, y + o.h + 8 - c);
        ctx.stroke();
        ctx.fillStyle = `rgba(${brand}, ${0.9 * k})`;
        ctx.fillText(o.label, x, y - 5);
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
