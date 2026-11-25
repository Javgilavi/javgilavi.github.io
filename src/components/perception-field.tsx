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

const LABELS = ["box", "bottle", "cup", "tool", "part", "can"];
const TAU = Math.PI * 2;
const BANDS = 6;

/** Planar 3-link arm (shoulder, elbow, vertical tool) running a pick cycle over the tracked objects. */
type Arm = {
  bx: number;
  by: number;
  L1: number;
  L2: number;
  L3: number;
  scale: number;
  up: boolean; // elbow above (desktop) or below (phones, where the menu bar is above)
  target: number;
  phase: 0 | 1; // 0: moving to the object, 1: grasping
  t0: number;
  fx: number;
  fy: number;
};

type Palette = { near: number[]; far: number[]; lit: string; ink: number; wedge: number };

const PALETTES: Record<"dark" | "light", Palette> = {
  // near → far: teal → indigo; `ink` scales alpha so the light canvas gets the same presence
  dark: { near: [94, 234, 212], far: [129, 140, 248], lit: "94, 234, 212", ink: 1, wedge: 0.11 },
  light: { near: [13, 148, 128], far: [79, 70, 229], lit: "13, 148, 128", ink: 1.55, wedge: 0.06 },
};

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(", ");

/**
 * A small robot cell drawn as line art: a LiDAR-style point field (scan rings, a sweeping beam
 * with a glowing wedge, range-coloured points, sonar pings), tracked objects that drift and
 * get labelled boxes when the beam passes, and a 3-link arm that plans a path to each object
 * and picks it, solved with inverse kinematics. Points part around the cursor.
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
    let arm: Arm | null = null;
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
        const cx = narrow ? w * (0.22 + (k / count) * 0.6 + rand() * 0.04) : w * (0.6 + (k / count) * 0.3 + rand() * 0.04);
        const cy = narrow ? h * (0.115 + rand() * 0.035) : h * (0.36 + rand() * 0.34);
        const bw = narrow ? 24 + rand() * 18 : 28 + rand() * 34;
        const bh = narrow ? 20 + rand() * 16 : 24 + rand() * 40;
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

      // the arm stands on the right (on phones, beside the objects above the text)
      arm = narrow
        ? { bx: w * 0.9, by: h * 0.2, L1: w * 0.34, L2: w * 0.3, L3: w * 0.05, scale: 0.6, up: false, target: 0, phase: 0, t0: -1, fx: 0, fy: 0 }
        : { bx: w * 0.86, by: h * 0.86, L1: h * 0.33, L2: h * 0.28, L3: h * 0.05, scale: 1, up: true, target: 0, phase: 0, t0: -1, fx: 0, fy: 0 };
      arm.fx = arm.bx - arm.L2 * 0.6;
      arm.fy = arm.by - arm.L1 * 0.9;
    };

    const angleTo = (x: number, y: number) => (Math.atan2(y - oy, x - ox) + TAU) % TAU;

    const MOVE_S = 1.9;
    const GRASP_S = 1.1;
    const rgba = (a: number) => `rgba(${pal.lit}, ${Math.min(1, a)})`;

    const drawArm = (A: Arm, t: number, ink: number) => {
      const o = objs[A.target];
      const gx = o.x;
      const gy = o.y - o.h / 2 - 6; // approach the object from above
      if (A.t0 < 0) A.t0 = t;
      const u = reduce ? 1 : Math.min(1, (t - A.t0) / MOVE_S);
      const cx = (A.fx + gx) / 2;
      const cy = Math.min(A.fy, gy) - 70 * A.scale;
      let px = gx,
        py = gy,
        grip = 1;
      if (A.phase === 0) {
        const e = u * u * (3 - 2 * u);
        px = (1 - e) * (1 - e) * A.fx + 2 * (1 - e) * e * cx + e * e * gx;
        py = (1 - e) * (1 - e) * A.fy + 2 * (1 - e) * e * cy + e * e * gy;
        if (u >= 1 && !reduce) {
          A.phase = 1;
          A.t0 = t;
        }
      } else {
        grip = 1 - Math.min(1, (t - A.t0) / 0.35);
        if (t - A.t0 > GRASP_S) {
          A.phase = 0;
          A.t0 = t;
          A.fx = gx;
          A.fy = gy;
          A.target = (A.target + 1) % objs.length;
        }
      }

      // inverse kinematics for the wrist; the tool hangs straight down from it
      const { bx, by, L1, L2, L3 } = A;
      const wx = px;
      const wy = py - L3;
      const dist = Math.max(Math.abs(L1 - L2) + 0.5, Math.min(L1 + L2 - 0.5, Math.hypot(wx - bx, wy - by)));
      const aim = Math.atan2(wy - by, wx - bx);
      const q2a = Math.acos(Math.max(-1, Math.min(1, (dist * dist - L1 * L1 - L2 * L2) / (2 * L1 * L2))));
      const solve = (q2: number) => {
        const q1 = aim - Math.atan2(L2 * Math.sin(q2), L1 + L2 * Math.cos(q2));
        return { q1, q2, ex: bx + L1 * Math.cos(q1), ey: by + L1 * Math.sin(q1) };
      };
      const s1 = solve(q2a);
      const s2 = solve(-q2a);
      const S = (s1.ey < s2.ey) === A.up ? s1 : s2;
      const wX = S.ex + L2 * Math.cos(S.q1 + S.q2);
      const wY = S.ey + L2 * Math.sin(S.q1 + S.q2);
      const tX = wX;
      const tY = wY + L3;
      const sc = A.scale;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // planned trajectory with waypoints while moving
      if (A.phase === 0 && !reduce) {
        ctx.setLineDash([3, 6]);
        ctx.strokeStyle = rgba(0.45 * ink);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(A.fx, A.fy);
        ctx.quadraticCurveTo(cx, cy, gx, gy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = rgba(0.6 * ink);
        for (let i = 1; i < 6; i++) {
          const e = i / 6;
          const qx = (1 - e) * (1 - e) * A.fx + 2 * (1 - e) * e * cx + e * e * gx;
          const qy = (1 - e) * (1 - e) * A.fy + 2 * (1 - e) * e * cy + e * e * gy;
          ctx.fillRect(qx - 1.5, qy - 1.5, 3, 3);
        }
      }

      // target reticle + task label
      const rr = 9 * sc + 4;
      ctx.strokeStyle = rgba(0.8 * ink);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(gx, gy, rr, 0, TAU);
      ctx.moveTo(gx - rr - 5, gy); ctx.lineTo(gx - rr + 3, gy);
      ctx.moveTo(gx + rr - 3, gy); ctx.lineTo(gx + rr + 5, gy);
      ctx.moveTo(gx, gy - rr - 5); ctx.lineTo(gx, gy - rr + 3);
      ctx.stroke();
      ctx.fillStyle = rgba(0.95 * ink);
      const task = A.phase === 0 ? `plan → pick(${o.label})` : `grasp ✓ ${o.label}`;
      const taskW = ctx.measureText(task).width;
      ctx.fillText(task, gx + rr + 8 + taskW > w - 4 ? gx - rr - 8 - taskW : gx + rr + 8, gy - rr - 2);

      // pedestal
      const pw = 30 * sc;
      const ph = 34 * sc;
      ctx.fillStyle = rgba(0.08 * ink);
      ctx.strokeStyle = rgba(0.55 * ink);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bx - pw * 0.45, by);
      ctx.lineTo(bx + pw * 0.45, by);
      ctx.lineTo(bx + pw, by + ph);
      ctx.lineTo(bx - pw, by + ph);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx - pw * 1.6, by + ph);
      ctx.lineTo(bx + pw * 1.6, by + ph);
      ctx.stroke();

      // links: translucent body + bright centre line
      const link = (x1: number, y1: number, x2: number, y2: number, wBody: number) => {
        ctx.strokeStyle = rgba(0.1 * ink);
        ctx.lineWidth = wBody;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = rgba(0.75 * ink);
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      };
      link(bx, by, S.ex, S.ey, 16 * sc);
      link(S.ex, S.ey, wX, wY, 13 * sc);
      link(wX, wY, tX, tY, 8 * sc);

      // gripper fingers
      const fo = (3 + grip * 7) * sc;
      const fl = 12 * sc;
      ctx.strokeStyle = rgba(0.85 * ink);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tX - fo - 2, tY); ctx.lineTo(tX + fo + 2, tY);
      ctx.moveTo(tX - fo, tY); ctx.lineTo(tX - fo * 0.7, tY + fl);
      ctx.moveTo(tX + fo, tY); ctx.lineTo(tX + fo * 0.7, tY + fl);
      ctx.stroke();

      // joints
      const joint = (x: number, y: number, r: number) => {
        ctx.fillStyle = rgba(0.16 * ink);
        ctx.strokeStyle = rgba(0.9 * ink);
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = rgba(0.95 * ink);
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill();
      };
      joint(bx, by, 9 * sc + 2);
      joint(S.ex, S.ey, 8 * sc + 2);
      joint(wX, wY, 6 * sc + 2);

      // joint readouts
      const deg = (r: number) => Math.round((((r * 180) / Math.PI) % 360 + 540) % 360 - 180);
      ctx.fillStyle = rgba(0.75 * ink);
      const readout = (text: string, x: number, y: number, off: number) => {
        const tw = ctx.measureText(text).width;
        ctx.fillText(text, x + off + tw > w - 4 ? x - off - tw : x + off, y - 6);
      };
      readout(`θ1 ${deg(-S.q1)}°`, bx, by, 14 * sc + 6);
      readout(`θ2 ${deg(-S.q2)}°`, S.ex, S.ey, 12 * sc + 6);

      // tool frame: x in rose, z (down) in the brand colour
      const ax = 16 * sc + 6;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(244, 63, 94, ${0.85 * Math.min(ink, 1.1)})`;
      ctx.beginPath(); ctx.moveTo(wX, wY); ctx.lineTo(wX + ax, wY); ctx.stroke();
      ctx.strokeStyle = `rgba(99, 102, 241, ${0.85 * Math.min(ink, 1.1)})`;
      ctx.beginPath(); ctx.moveTo(wX, wY); ctx.lineTo(wX, wY - ax); ctx.stroke();
    };

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
        let k = reduce ? 0.85 : d >= 0 ? Math.exp(-d * 1.6) : Math.exp(d * 18);
        const targeted = arm !== null && objs[arm.target] === o;
        if (targeted) k = Math.max(k, arm!.phase === 1 ? 1 : 0.75);
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

      if (arm) drawArm(arm, t, ink);

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
