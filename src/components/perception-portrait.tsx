"use client";

import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { asset } from "@/lib/utils";

// Detections in % of the displayed 4:5 frame (the 2:3 photo is centre-cropped).
const BOXES = [
  { label: "javier", conf: "0.99", top: 28.4, left: 39, w: 22, h: 18.4, jitter: true },
  { label: "humanoid", conf: "0.97", top: 48.8, left: 13, w: 55, h: 36, jitter: false },
];
const SCAN_S = 2.4;

function Corners() {
  const c = "absolute size-3 border-emerald-300";
  return (
    <>
      <span className={`${c} top-0 left-0 border-t-2 border-l-2`} />
      <span className={`${c} top-0 right-0 border-t-2 border-r-2`} />
      <span className={`${c} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${c} right-0 bottom-0 border-r-2 border-b-2`} />
    </>
  );
}

/**
 * The About photo as a perception demo: a scan line sweeps down and reveals the photo in
 * colour, detection boxes lock onto the person and the robot as the scan passes them, and
 * the card tilts towards the cursor with a moving glare.
 */
export function PerceptionPortrait({ location }: { location: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const run = inView || !!reduce;

  // pointer tilt + glare
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-9, 9]), { stiffness: 150, damping: 18 });
  const gx = useTransform(px, (v) => v * 100);
  const gy = useTransform(py, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22), transparent 45%)`;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div ref={ref} style={{ perspective: 1100 }}>
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="elevated group relative aspect-[4/5] overflow-hidden rounded-2xl border bg-surface"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/media/me.webp")}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.45] contrast-125 blur-[1.5px] transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {/* raw-sensor look before the scan: teal tint and scan lines */}
        <div className="pointer-events-none absolute inset-0 bg-emerald-500/30 mix-blend-color" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.25)_0px,rgba(0,0,0,0.25)_1px,transparent_1px,transparent_3px)]" />
        {/* the clean photo, revealed by the scan */}
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: reduce ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" }}
          animate={run ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
          transition={{ duration: reduce ? 0 : SCAN_S, ease: [0.45, 0, 0.25, 1], delay: 0.2 }}
          onAnimationComplete={() => setDone(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/media/me.webp")}
            alt="Javier Gil Avilés crouching next to a humanoid robot at a robotics hackathon"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </motion.div>

        {/* first-pass scan line */}
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-16 -translate-y-full"
            initial={{ top: "0%", opacity: 0 }}
            animate={run ? { top: "100%", opacity: [0, 1, 1, 0] } : undefined}
            transition={{ duration: SCAN_S, ease: [0.45, 0, 0.25, 1], delay: 0.2, opacity: { duration: SCAN_S, times: [0, 0.05, 0.9, 1], delay: 0.2 } }}
          >
            <div className="h-full bg-gradient-to-b from-transparent to-emerald-300/30" />
            <div className="h-px bg-emerald-300 shadow-[0_0_12px_2px_rgba(110,231,183,0.7)]" />
          </motion.div>
        )}
        {/* idle re-scan once the photo is revealed */}
        {done && !reduce && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-[portrait-scan_7s_ease-in-out_infinite] bg-emerald-300/70 shadow-[0_0_10px_1px_rgba(110,231,183,0.5)]" />
        )}

        {/* detections */}
        {BOXES.map((b) => (
          <motion.div
            key={b.label}
            className="pointer-events-none absolute"
            style={{ top: `${b.top}%`, left: `${b.left}%`, width: `${b.w}%`, height: `${b.h}%` }}
            initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 1.25 }}
            animate={run ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.2 + (b.top / 100) * SCAN_S }}
          >
            <motion.div
              className="absolute inset-0"
              animate={b.jitter && !reduce && done ? { x: [0, 1.5, -1, 0.5, 0], y: [0, -1, 1, 0, 0] } : undefined}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 rounded-[3px] bg-emerald-300/[0.06] ring-1 ring-emerald-300/40" />
              <Corners />
              <span className="absolute -top-6 left-0 flex items-center gap-1.5 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-emerald-200 backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                {b.label} {b.conf}
              </span>
            </motion.div>
          </motion.div>
        ))}

        {/* HUD */}
        <motion.div
          className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-2 py-1 font-mono text-[10px] text-white/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={run ? { opacity: 1 } : undefined}
          transition={{ delay: 0.3 }}
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-rose-400" />
          </span>
          cam_01 · {done || reduce ? "2 detections" : "scanning…"}
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: glare }} />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/50 px-3 py-2 font-mono text-[11px] text-white/85 backdrop-blur-md">
          <span>{location}</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" /> available
          </span>
        </div>
      </motion.div>
    </div>
  );
}
