"use client";

import { useEffect, useRef } from "react";

/**
 * The hero background as a live robot scene, drawn like an RViz view:
 * - a floor grid and an occupancy map with inflated obstacles (a costmap),
 * - a mobile robot that plans paths with A*, follows them with pure pursuit and
 *   ray-casts a 2D laser scan against the map,
 * - on wider screens, a workcell where a 3-link arm picks tracked parts using
 *   inverse kinematics.
 * Hovering the map sets the robot's navigation goal.
 */

type Pt = { x: number; y: number };
type Part = { cx: number; cy: number; x: number; y: number; w: number; h: number; label: string; conf: number; phase: number; dots: Pt[] };
type Arm = { bx: number; by: number; L1: number; L2: number; L3: number; target: number; phase: 0 | 1; t0: number; fx: number; fy: number };
type Nav = { x0: number; y0: number; cols: number; rows: number; cell: number; occ: Uint8Array; dist: Float32Array; odist: Float32Array };
type Robot = {
  x: number;
  y: number;
  th: number;
  path: Pt[];
  goal: Pt | null;
  goalTh: number;
  arrivedAt: number;
  trail: Pt[];
  user: boolean;
  lastPlan: number;
  v: number;
};

type Palette = { lit: string; grid: string; gridA: number; laser: string; goal: string; obst: string; x: string; y: string; ink: number };
const PALETTES: Record<"dark" | "light", Palette> = {
  dark: { lit: "94, 234, 212", grid: "148, 163, 184", gridA: 0.055, laser: "251, 113, 133", goal: "232, 121, 249", obst: "148, 163, 184", x: "244, 63, 94", y: "52, 211, 153", ink: 1 },
  light: { lit: "13, 148, 128", grid: "51, 65, 85", gridA: 0.045, laser: "225, 29, 72", goal: "192, 38, 211", obst: "51, 65, 85", x: "225, 29, 72", y: "5, 150, 105", ink: 1.35 },
};

const TAU = Math.PI * 2;
const LABELS = ["box", "bottle", "gear", "can"];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function PerceptionField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bg = document.createElement("canvas");
    const bctx = bg.getContext("2d");
    if (!bctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0,
      h = 0,
      dpr = 1,
      narrow = false;
    let raf = 0;
    let visible = true;
    let pal = PALETTES.dark;
    let nav: Nav | null = null;
    let robot: Robot | null = null;
    let arm: Arm | null = null;
    let parts: Part[] = [];
    let cellRect = { x: 0, y: 0, w: 0, h: 0 };
    const mouse = { x: -9999, y: -9999 };

    let seed = 11;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const rgba = (c: string, a: number) => `rgba(${c}, ${clamp(a, 0, 1)})`;

    // ---------- occupancy map ----------
    const idx = (c: number, r: number) => r * nav!.cols + c;
    const inside = (c: number, r: number) => nav !== null && c >= 0 && r >= 0 && c < nav.cols && r < nav.rows;
    const toCell = (x: number, y: number) => ({ c: Math.floor((x - nav!.x0) / nav!.cell), r: Math.floor((y - nav!.y0) / nav!.cell) });
    const center = (c: number, r: number): Pt => ({ x: nav!.x0 + (c + 0.5) * nav!.cell, y: nav!.y0 + (r + 0.5) * nav!.cell });
    const free = (c: number, r: number, margin = 1.5) => inside(c, r) && nav!.dist[idx(c, r)] > margin;

    const buildNav = (x0: number, y0: number, wpx: number, hpx: number, cell: number, nObs: number) => {
      const cols = Math.floor(wpx / cell);
      const rows = Math.floor(hpx / cell);
      const occ = new Uint8Array(cols * rows);
      for (let k = 0; k < nObs; k++) {
        const ow = 2 + Math.floor(rand() * 4);
        const oh = 1 + Math.floor(rand() * 3);
        const oc = 2 + Math.floor(rand() * (cols - ow - 4));
        const orr = 2 + Math.floor(rand() * (rows - oh - 4));
        for (let r = orr; r < orr + oh; r++) for (let c = oc; c < oc + ow; c++) occ[r * cols + c] = 1;
      }
      // distance (in cells) to the nearest obstacle, capped at 4; planning also keeps clear of the map edge
      const dist = new Float32Array(cols * rows).fill(4);
      const odist = new Float32Array(cols * rows).fill(4);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          let best = 4;
          if (occ[r * cols + c]) best = 0;
          else
            for (let dr = -4; dr <= 4; dr++)
              for (let dc = -4; dc <= 4; dc++) {
                const cc = c + dc,
                  rr = r + dr;
                if (cc < 0 || rr < 0 || cc >= cols || rr >= rows || !occ[rr * cols + cc]) continue;
                best = Math.min(best, Math.hypot(dc, dr));
              }
          odist[r * cols + c] = best;
          dist[r * cols + c] = Math.min(best, c + 0.5, r + 0.5, cols - c - 0.5, rows - r - 0.5);
        }
      nav = { x0, y0, cols, rows, cell, occ, dist, odist };
    };

    // A* on the 8-connected grid, penalising cells close to obstacles (inflation)
    const plan = (from: Pt, to: Pt): Pt[] => {
      if (!nav) return [];
      const { cols, rows } = nav;
      const s = toCell(from.x, from.y);
      const g = toCell(to.x, to.y);
      if (!inside(s.c, s.r) || !free(g.c, g.r)) return [];
      const N = cols * rows;
      const gs = new Float32Array(N).fill(Infinity);
      const fs = new Float32Array(N).fill(Infinity);
      const came = new Int32Array(N).fill(-1);
      const closed = new Uint8Array(N);
      const open: number[] = [idx(s.c, s.r)];
      gs[open[0]] = 0;
      const hfn = (c: number, r: number) => {
        const dx = Math.abs(c - g.c),
          dy = Math.abs(r - g.r);
        return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
      };
      fs[open[0]] = hfn(s.c, s.r);
      const goalI = idx(g.c, g.r);
      while (open.length) {
        let bi = 0;
        for (let i = 1; i < open.length; i++) if (fs[open[i]] < fs[open[bi]]) bi = i;
        const cur = open[bi];
        open[bi] = open[open.length - 1];
        open.pop();
        if (cur === goalI) break;
        if (closed[cur]) continue;
        closed[cur] = 1;
        const cc = cur % cols,
          cr = (cur / cols) | 0;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            if (!dc && !dr) continue;
            const nc = cc + dc,
              nr = cr + dr;
            if (!free(nc, nr, 1.2)) continue;
            const ni = idx(nc, nr);
            if (closed[ni]) continue;
            const d = nav.dist[ni];
            const step = (dc && dr ? Math.SQRT2 : 1) * (1 + (d < 3 ? (3 - d) * 1.5 : 0));
            const ng = gs[cur] + step;
            if (ng < gs[ni]) {
              gs[ni] = ng;
              fs[ni] = ng + hfn(nc, nr);
              came[ni] = cur;
              open.push(ni);
            }
          }
      }
      if (came[goalI] < 0 && goalI !== idx(s.c, s.r)) return [];
      const cells: Pt[] = [];
      for (let i = goalI; i >= 0; i = came[i]) cells.push(center(i % cols, (i / cols) | 0));
      cells.reverse();
      cells[0] = { x: from.x, y: from.y };
      cells[cells.length - 1] = { x: to.x, y: to.y };
      // shortcut with line-of-sight checks, then round the corners (Chaikin)
      const los = (a: Pt, b: Pt) => {
        const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (nav!.cell * 0.4));
        for (let i = 1; i < n; i++) {
          const q = toCell(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n);
          if (!free(q.c, q.r, 1.2)) return false;
        }
        return true;
      };
      const short: Pt[] = [cells[0]];
      let i = 0;
      while (i < cells.length - 1) {
        let j = cells.length - 1;
        while (j > i + 1 && !los(cells[i], cells[j])) j--;
        short.push(cells[j]);
        i = j;
      }
      let path = short;
      for (let it = 0; it < 2; it++) {
        const out: Pt[] = [path[0]];
        for (let k = 0; k < path.length - 1; k++) {
          const a = path[k],
            b = path[k + 1];
          out.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 }, { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
        }
        out.push(path[path.length - 1]);
        path = out;
      }
      return path;
    };

    const randomGoal = (): Pt | null => {
      if (!nav || !robot) return null;
      for (let k = 0; k < 60; k++) {
        const c = Math.floor(rand() * nav.cols),
          r = Math.floor(rand() * nav.rows);
        if (!free(c, r, 2)) continue;
        const p = center(c, r);
        if (Math.hypot(p.x - robot.x, p.y - robot.y) > Math.min(nav.cols, nav.rows) * nav.cell * 0.55) return p;
      }
      return null;
    };

    const setGoal = (g: Pt, t: number, user: boolean) => {
      if (!robot) return;
      const p = plan(robot, g);
      if (!p.length) return;
      robot.goal = g;
      robot.path = p;
      robot.user = user;
      robot.lastPlan = t;
      robot.arrivedAt = -1;
      const n = p.length;
      robot.goalTh = n > 1 ? Math.atan2(p[n - 1].y - p[n - 2].y, p[n - 1].x - p[n - 2].x) : robot.th;
    };

    // ---------- layout ----------
    const readColors = () => {
      pal = document.documentElement.classList.contains("dark") ? PALETTES.dark : PALETTES.light;
    };

    const paintStatic = () => {
      bg.width = canvas.width;
      bg.height = canvas.height;
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, w, h);
      // floor grid
      const g = narrow ? 24 : 32;
      for (let x = 0, i = 0; x <= w; x += g, i++) {
        bctx.fillStyle = rgba(pal.grid, pal.gridA * (i % 4 === 0 ? 2 : 1) * pal.ink);
        bctx.fillRect(Math.round(x), 0, 1, h);
      }
      for (let y = 0, i = 0; y <= h; y += g, i++) {
        bctx.fillStyle = rgba(pal.grid, pal.gridA * (i % 4 === 0 ? 2 : 1) * pal.ink);
        bctx.fillRect(0, Math.round(y), w, 1);
      }
      // keep the grid faint behind the hero text on the left
      bctx.globalCompositeOperation = "destination-in";
      const fade = bctx.createLinearGradient(0, 0, w, 0);
      fade.addColorStop(0, "rgba(0,0,0,0.25)");
      fade.addColorStop(narrow ? 0.01 : 0.55, "rgba(0,0,0,1)");
      bctx.fillStyle = fade;
      bctx.fillRect(0, 0, w, h);
      bctx.globalCompositeOperation = "source-over";
      if (!nav) return;
      const { x0, y0, cols, rows, cell, occ, odist: dist } = nav;
      // costmap: inflation halo, then lethal cells
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const d = dist[r * cols + c];
          if (occ[r * cols + c]) {
            bctx.fillStyle = rgba(pal.obst, (pal.ink > 1 ? 0.2 : 0.32) * pal.ink);
            bctx.fillRect(x0 + c * cell, y0 + r * cell, cell, cell);
          } else if (d < 3) {
            bctx.fillStyle = rgba(pal.lit, (0.12 - d * 0.035) * pal.ink);
            bctx.fillRect(x0 + c * cell, y0 + r * cell, cell, cell);
          }
        }
      bctx.strokeStyle = rgba(pal.obst, 0.55 * pal.ink);
      bctx.lineWidth = 1;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          if (!occ[r * cols + c]) continue;
          const x = x0 + c * cell,
            y = y0 + r * cell;
          if (r === 0 || !occ[(r - 1) * cols + c]) bctx.strokeRect(x, y, cell, 0);
          if (r === rows - 1 || !occ[(r + 1) * cols + c]) bctx.strokeRect(x, y + cell, cell, 0);
          if (c === 0 || !occ[r * cols + c - 1]) bctx.strokeRect(x, y, 0, cell);
          if (c === cols - 1 || !occ[r * cols + c + 1]) bctx.strokeRect(x + cell, y, 0, cell);
        }
      // map boundary + frame
      bctx.setLineDash([4, 6]);
      bctx.strokeStyle = rgba(pal.grid, 0.35 * pal.ink);
      bctx.strokeRect(x0, y0, cols * cell, rows * cell);
      bctx.setLineDash([]);
      bctx.font = "500 10px var(--font-geist-mono), ui-monospace, monospace";
      bctx.fillStyle = rgba(pal.grid, 0.75 * pal.ink);
      bctx.fillText("/map  ·  global_costmap", x0 + 4, y0 - 6);
      axes(bctx, x0, y0 + rows * cell, 0, 18, "map");
      // workcell
      if (cellRect.w > 0) {
        bctx.setLineDash([4, 6]);
        bctx.strokeStyle = rgba(pal.grid, 0.35 * pal.ink);
        bctx.strokeRect(cellRect.x, cellRect.y, cellRect.w, cellRect.h);
        bctx.setLineDash([]);
        bctx.fillStyle = rgba(pal.grid, 0.75 * pal.ink);
        bctx.fillText("/workcell  ·  pick & place", cellRect.x + 4, cellRect.y - 6);
        // the table the parts sit on
        bctx.fillStyle = rgba(pal.obst, 0.08 * pal.ink);
        bctx.strokeStyle = rgba(pal.obst, 0.4 * pal.ink);
        const tx = cellRect.x + 14,
          ty = cellRect.y + cellRect.h * 0.18,
          tw = cellRect.w * 0.62,
          th = cellRect.h * 0.42;
        bctx.fillRect(tx, ty, tw, th);
        bctx.strokeRect(tx, ty, tw, th);
      }
    };

    // a TF frame: x in red, y in green (y points up on screen, like RViz top-down)
    function axes(c: CanvasRenderingContext2D, x: number, y: number, th: number, len: number, label?: string) {
      c.lineWidth = 1.6;
      c.strokeStyle = rgba(pal.x, 0.9);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + Math.cos(th) * len, y + Math.sin(th) * len);
      c.stroke();
      c.strokeStyle = rgba(pal.y, 0.9);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + Math.sin(th) * len, y - Math.cos(th) * len);
      c.stroke();
      if (label) {
        c.fillStyle = rgba(pal.grid, 0.75 * pal.ink);
        c.fillText(label, x + 4, y + 12);
      }
    }

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      narrow = w < 768;
      seed = 11;
      parts = [];
      arm = null;
      cellRect = { x: 0, y: 0, w: 0, h: 0 };

      if (narrow) {
        // phones: the map fills the band above the hero text
        buildNav(w * 0.05, h * 0.09, w * 0.9, h * 0.125, 12, 4);
      } else {
        buildNav(w * 0.6, h * 0.1, w * 0.37, h * 0.36, 16, 7);
        // workcell: a table with parts and an arm standing to its right
        cellRect = { x: w * 0.62, y: h * 0.54, w: w * 0.35, h: h * 0.36 };
        const count = 3;
        for (let k = 0; k < count; k++) {
          const pw = 22 + rand() * 18;
          const ph = 18 + rand() * 18;
          const cx = cellRect.x + 30 + (k + 0.5) * ((cellRect.w * 0.62 - 40) / count);
          const cy = cellRect.y + cellRect.h * (0.3 + rand() * 0.2);
          const dots: Pt[] = [];
          for (let i = 0; i < (pw * ph) / 30; i++) dots.push({ x: (rand() - 0.5) * pw, y: (rand() - 0.5) * ph });
          parts.push({ cx, cy, x: cx, y: cy, w: pw, h: ph, label: LABELS[k], conf: 0.86 + rand() * 0.12, phase: rand() * TAU, dots });
        }
        arm = {
          bx: cellRect.x + cellRect.w * 0.84,
          by: cellRect.y + cellRect.h * 0.86,
          L1: cellRect.h * 0.66,
          L2: cellRect.h * 0.6,
          L3: cellRect.h * 0.1,
          target: 0,
          phase: 0,
          t0: -1,
          fx: 0,
          fy: 0,
        };
        arm.fx = arm.bx - arm.L2 * 0.8;
        arm.fy = arm.by - arm.L1 * 0.9;
      }

      // drop the robot on a free cell near the map's left edge
      robot = null;
      if (nav) {
        let start = center(1, 1);
        for (let k = 0; k < 200; k++) {
          const c = 1 + Math.floor(rand() * Math.max(1, nav.cols * 0.3));
          const r = 1 + Math.floor(rand() * (nav.rows - 2));
          if (free(c, r, 2)) {
            start = center(c, r);
            break;
          }
        }
        robot = { x: start.x, y: start.y, th: 0, path: [], goal: null, goalTh: 0, arrivedAt: 0, trail: [], user: false, lastPlan: -9, v: 0 };
      }
      paintStatic();
    };

    // ---------- per-frame drawing ----------
    const MOVE_S = 1.8;
    const GRASP_S = 1.1;

    const stepRobot = (t: number, dt: number) => {
      if (!robot || !nav) return;
      const R = robot;
      // pick a new goal once the last one has been reached
      if (!R.path.length && (R.arrivedAt < 0 || t - R.arrivedAt > 0.9)) {
        const g = randomGoal();
        if (g) setGoal(g, t, false);
      }
      if (R.path.length && !reduce) {
        // pure pursuit: steer towards a point a fixed distance ahead on the path
        const look = nav.cell * 1.8;
        let k = 0;
        while (k < R.path.length - 1 && Math.hypot(R.path[k].x - R.x, R.path[k].y - R.y) < look) k++;
        R.path.splice(0, Math.max(0, k - 1));
        const target = R.path[Math.min(1, R.path.length - 1)];
        const end = R.path[R.path.length - 1];
        const dEnd = Math.hypot(end.x - R.x, end.y - R.y);
        let err = Math.atan2(target.y - R.y, target.x - R.x) - R.th;
        err = Math.atan2(Math.sin(err), Math.cos(err));
        const vmax = narrow ? 42 : 64;
        const v = vmax * clamp(1 - Math.abs(err) / 1.6, 0.08, 1) * clamp(dEnd / (nav.cell * 2), 0.25, 1);
        R.v += (v - R.v) * 0.12;
        R.th += clamp(err * 3, -2.6, 2.6) * dt;
        R.x += Math.cos(R.th) * R.v * dt;
        R.y += Math.sin(R.th) * R.v * dt;
        if (dEnd < nav.cell * 0.4) {
          R.path = [];
          R.arrivedAt = t;
          R.v = 0;
        }
        if (!R.trail.length || Math.hypot(R.trail[R.trail.length - 1].x - R.x, R.trail[R.trail.length - 1].y - R.y) > 6) {
          R.trail.push({ x: R.x, y: R.y });
          if (R.trail.length > 70) R.trail.shift();
        }
      }
    };

    const drawRobot = (t: number) => {
      if (!robot || !nav) return;
      const R = robot;
      const ink = pal.ink;
      const sc = narrow ? 0.7 : 1;

      // laser scan, ray-cast against the occupancy map
      const rays = narrow ? 72 : 120;
      const range = nav.cell * (narrow ? 9 : 13);
      const step = nav.cell * 0.35;
      const hits: Pt[] = [];
      ctx.strokeStyle = rgba(pal.laser, 0.07 * ink);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < rays; i++) {
        const a = R.th + (i / rays) * TAU;
        const ca = Math.cos(a),
          sa = Math.sin(a);
        let d = step;
        let hit = false;
        for (; d < range; d += step) {
          const q = toCell(R.x + ca * d, R.y + sa * d);
          if (!inside(q.c, q.r) || nav.occ[idx(q.c, q.r)]) {
            hit = true;
            break;
          }
        }
        const ex = R.x + ca * d,
          ey = R.y + sa * d;
        if (i % 3 === 0) {
          ctx.moveTo(R.x, R.y);
          ctx.lineTo(ex, ey);
        }
        if (hit) hits.push({ x: ex, y: ey });
      }
      ctx.stroke();
      ctx.fillStyle = rgba(pal.laser, 0.9 * Math.min(ink, 1.1));
      for (const p of hits) ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.4, 2.4);

      // odometry trail
      for (let i = 0; i < R.trail.length; i += 2) {
        ctx.fillStyle = rgba(pal.lit, (i / R.trail.length) * 0.45 * ink);
        ctx.fillRect(R.trail[i].x - 1, R.trail[i].y - 1, 2, 2);
      }

      // global plan
      if (R.path.length > 1) {
        ctx.strokeStyle = rgba(pal.lit, 0.85 * ink);
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(R.x, R.y);
        for (const p of R.path) ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      // goal pose (RViz-style arrow)
      if (R.goal) {
        const gx = R.goal.x,
          gy = R.goal.y;
        const reached = !R.path.length;
        const pulse = reduce ? 0 : (Math.sin(t * 4) + 1) / 2;
        ctx.strokeStyle = rgba(pal.goal, 0.9);
        ctx.fillStyle = rgba(pal.goal, 0.15 + pulse * 0.1);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(gx, gy, 7 * sc + pulse * 2, 0, TAU);
        ctx.fill();
        ctx.stroke();
        const al = 18 * sc;
        const ax = gx + Math.cos(R.goalTh) * al,
          ay = gy + Math.sin(R.goalTh) * al;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(ax, ay);
        ctx.lineTo(ax - Math.cos(R.goalTh - 0.5) * 6, ay - Math.sin(R.goalTh - 0.5) * 6);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - Math.cos(R.goalTh + 0.5) * 6, ay - Math.sin(R.goalTh + 0.5) * 6);
        ctx.stroke();
        ctx.fillStyle = rgba(pal.goal, 0.95);
        const label = reached ? "goal reached ✓" : R.user ? "nav goal (cursor)" : "nav goal";
        const tw = ctx.measureText(label).width;
        ctx.fillText(label, gx + 12 + tw > w - 4 ? gx - 12 - tw : gx + 12, gy - 10);
      }

      // robot footprint: differential-drive base with wheels and a lidar puck
      const L = 30 * sc,
        W = 22 * sc;
      ctx.save();
      ctx.translate(R.x, R.y);
      ctx.rotate(R.th);
      ctx.fillStyle = rgba(pal.obst, 0.7 * ink);
      ctx.fillRect(-L * 0.32, -W / 2 - 3, L * 0.38, 3);
      ctx.fillRect(-L * 0.32, W / 2, L * 0.38, 3);
      ctx.fillStyle = rgba(pal.lit, 0.2 * ink);
      ctx.strokeStyle = rgba(pal.lit, 0.95 * ink);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-L / 2, -W / 2, L, W, 5 * sc);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(L / 2 - 2, 0);
      ctx.lineTo(L / 2 - 9 * sc, -5 * sc);
      ctx.lineTo(L / 2 - 9 * sc, 5 * sc);
      ctx.closePath();
      ctx.fillStyle = rgba(pal.lit, 0.95 * ink);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 4 * sc, 0, TAU);
      ctx.stroke();
      ctx.restore();
      axes(ctx, R.x, R.y, R.th, 14 * sc);

      ctx.fillStyle = rgba(pal.lit, 0.9 * ink);
      const speed = `amr_01 · ${(R.v / 80).toFixed(2)} m/s`;
      ctx.fillText(speed, R.x + 18 * sc, R.y + 22 * sc);
    };

    const drawArm = (A: Arm, t: number) => {
      const ink = pal.ink;
      const o = parts[A.target];
      const gx = o.x;
      const gy = o.y - o.h / 2 - 4;
      if (A.t0 < 0) A.t0 = t;
      const u = reduce ? 1 : Math.min(1, (t - A.t0) / MOVE_S);
      const cx = (A.fx + gx) / 2;
      const cy = Math.min(A.fy, gy) - 60;
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
          A.target = (A.target + 1) % parts.length;
        }
      }

      // inverse kinematics for the wrist; the tool hangs straight down from it
      const { bx, by, L1, L2, L3 } = A;
      const wx = px,
        wy = py - L3;
      const dist = clamp(Math.hypot(wx - bx, wy - by), Math.abs(L1 - L2) + 0.5, L1 + L2 - 0.5);
      const aim = Math.atan2(wy - by, wx - bx);
      const q2a = Math.acos(clamp((dist * dist - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1));
      const solve = (q2: number) => {
        const q1 = aim - Math.atan2(L2 * Math.sin(q2), L1 + L2 * Math.cos(q2));
        return { q1, q2, ex: bx + L1 * Math.cos(q1), ey: by + L1 * Math.sin(q1) };
      };
      const s1 = solve(q2a),
        s2 = solve(-q2a);
      const S = s1.ey < s2.ey ? s1 : s2; // elbow up
      const wX = S.ex + L2 * Math.cos(S.q1 + S.q2);
      const wY = S.ey + L2 * Math.sin(S.q1 + S.q2);
      const tX = wX,
        tY = wY + L3;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (A.phase === 0 && !reduce) {
        ctx.setLineDash([3, 6]);
        ctx.strokeStyle = rgba(pal.lit, 0.5 * ink);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(A.fx, A.fy);
        ctx.quadraticCurveTo(cx, cy, gx, gy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // pedestal
      ctx.fillStyle = rgba(pal.lit, 0.1 * ink);
      ctx.strokeStyle = rgba(pal.lit, 0.6 * ink);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bx - 14, by);
      ctx.lineTo(bx + 14, by);
      ctx.lineTo(bx + 26, by + 26);
      ctx.lineTo(bx - 26, by + 26);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const link = (x1: number, y1: number, x2: number, y2: number, wb: number) => {
        ctx.strokeStyle = rgba(pal.lit, 0.12 * ink);
        ctx.lineWidth = wb;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = rgba(pal.lit, 0.8 * ink);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      };
      link(bx, by, S.ex, S.ey, 15);
      link(S.ex, S.ey, wX, wY, 12);
      link(wX, wY, tX, tY, 8);

      const fo = 3 + grip * 7;
      ctx.strokeStyle = rgba(pal.lit, 0.9 * ink);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tX - fo - 2, tY); ctx.lineTo(tX + fo + 2, tY);
      ctx.moveTo(tX - fo, tY); ctx.lineTo(tX - fo * 0.7, tY + 11);
      ctx.moveTo(tX + fo, tY); ctx.lineTo(tX + fo * 0.7, tY + 11);
      ctx.stroke();

      const joint = (x: number, y: number, r: number) => {
        ctx.fillStyle = rgba(pal.lit, 0.18 * ink);
        ctx.strokeStyle = rgba(pal.lit, 0.95 * ink);
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = rgba(pal.lit, 0.95 * ink);
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill();
      };
      joint(bx, by, 10);
      joint(S.ex, S.ey, 9);
      joint(wX, wY, 7);

      const deg = (r: number) => Math.round((((r * 180) / Math.PI) % 360 + 540) % 360 - 180);
      ctx.fillStyle = rgba(pal.lit, 0.8 * ink);
      ctx.fillText(`θ1 ${deg(-S.q1)}°`, bx + 16, by - 8);
      ctx.fillText(`θ2 ${deg(-S.q2)}°`, S.ex + 14, S.ey - 8);
      axes(ctx, tX, tY, 0, 14);

      // target reticle and task status
      ctx.strokeStyle = rgba(pal.goal, 0.85);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(gx, gy, 8, 0, TAU);
      ctx.moveTo(gx - 13, gy); ctx.lineTo(gx - 5, gy);
      ctx.moveTo(gx + 5, gy); ctx.lineTo(gx + 13, gy);
      ctx.stroke();
      ctx.fillStyle = rgba(pal.goal, 0.95);
      ctx.fillText(A.phase === 0 ? `plan → pick(${o.label})` : `grasp ✓ ${o.label}`, gx - 30, gy - 16);
    };

    const drawParts = (t: number) => {
      const ink = pal.ink;
      for (let k = 0; k < parts.length; k++) {
        const o = parts[k];
        o.x = o.cx + (reduce ? 0 : Math.sin(t * 0.5 + o.phase) * 3);
        o.y = o.cy + (reduce ? 0 : Math.cos(t * 0.4 + o.phase) * 2);
        const on = arm !== null && arm.target === k;
        ctx.fillStyle = rgba(pal.lit, (on ? 0.85 : 0.5) * ink);
        for (const d of o.dots) ctx.fillRect(o.x + d.x - 0.8, o.y + d.y - 0.8, 1.6, 1.6);
        const x = o.x - o.w / 2 - 4,
          y = o.y - o.h / 2 - 4,
          bw = o.w + 8,
          bh = o.h + 8,
          c = 6;
        ctx.strokeStyle = rgba(pal.lit, (on ? 0.95 : 0.55) * ink);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y + c); ctx.lineTo(x, y); ctx.lineTo(x + c, y);
        ctx.moveTo(x + bw - c, y); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw, y + c);
        ctx.moveTo(x + bw, y + bh - c); ctx.lineTo(x + bw, y + bh); ctx.lineTo(x + bw - c, y + bh);
        ctx.moveTo(x + c, y + bh); ctx.lineTo(x, y + bh); ctx.lineTo(x, y + bh - c);
        ctx.stroke();
        ctx.fillStyle = rgba(pal.lit, (on ? 0.95 : 0.6) * ink);
        ctx.fillText(`${o.label} ${o.conf.toFixed(2)}`, x, y + bh + 12);
      }
    };

    const start = performance.now();
    let last = start;
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(bg, 0, 0, w, h);
      ctx.font = "500 10px var(--font-geist-mono), ui-monospace, monospace";

      // hovering the map sets the navigation goal
      if (robot && nav && !narrow) {
        const q = toCell(mouse.x, mouse.y);
        if (inside(q.c, q.r) && free(q.c, q.r, 2) && t - robot.lastPlan > 0.3) {
          const g = center(q.c, q.r);
          if (!robot.goal || Math.hypot(g.x - robot.goal.x, g.y - robot.goal.y) > nav.cell) setGoal(g, t, true);
        }
      }
      stepRobot(t, dt);
      drawRobot(t);
      if (parts.length) drawParts(t);
      if (arm && parts.length) drawArm(arm, t);

      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
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
      if (visible && !was && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(canvas);

    const mo = new MutationObserver(() => {
      readColors();
      paintStatic();
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
