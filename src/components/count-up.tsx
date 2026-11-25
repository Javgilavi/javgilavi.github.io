"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/** Counts the first number in `value` up from zero when it scrolls into view ("20+", "Top 5%"). */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  const target = m ? Number(m[2]) : 0;
  const [n, setN] = useState(m && !reduce ? 0 : target);

  useEffect(() => {
    if (!m || !inView || reduce) return;
    const controls = animate(0, target, { duration: 1.2, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, target, m]);

  if (!m) return <span>{value}</span>;
  return (
    <span ref={ref} className="tabular-nums">
      {m[1]}
      {n}
      {m[3]}
    </span>
  );
}
