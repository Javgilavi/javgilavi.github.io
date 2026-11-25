"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Counts the first number in `value` up from zero when it scrolls into view ("3+", "Top 5%").
 * The static HTML holds the final value, so it is correct without JavaScript; the count only
 * writes the text node, so React never re-renders mid-animation.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  const prefix = m?.[1] ?? "";
  const target = m ? Number(m[2]) : 0;
  const suffix = m?.[3] ?? "";
  const numeric = m !== null;
  const counted = useRef(false);

  // start from zero until the stat is on screen
  useEffect(() => {
    if (!numeric || reduce || counted.current || !ref.current) return;
    ref.current.textContent = `${prefix}0${suffix}`;
  }, [numeric, reduce, prefix, suffix]);

  useEffect(() => {
    if (!numeric || reduce || !inView || counted.current) return;
    counted.current = true;
    const el = ref.current;
    const controls = animate(0, target, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (el) el.textContent = `${prefix}${Math.round(v)}${suffix}`;
      },
    });
    return () => {
      controls.stop();
      if (el) el.textContent = `${prefix}${target}${suffix}`;
    };
  }, [numeric, reduce, inView, prefix, target, suffix]);

  return (
    <span ref={ref} className={numeric ? "tabular-nums" : undefined}>
      {value}
    </span>
  );
}
