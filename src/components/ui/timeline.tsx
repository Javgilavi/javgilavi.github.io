"use client";
import { motion, useScroll, useTransform } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

/** Scroll-driven timeline (adapted from Aceternity UI): a beam fills as you scroll. */
export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => setHeight(el.getBoundingClientRect().height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  return (
    <div ref={ref} className="relative">
      {data.map((item, index) => (
        <div key={index} className="flex justify-start pt-6 first:pt-0 md:gap-10 md:pt-14">
          <div className="sticky top-28 z-10 flex max-w-xs flex-col self-start md:w-full md:flex-row lg:max-w-sm">
            <div className="absolute left-0 grid size-8 place-items-center rounded-full bg-background">
              <div className="size-2.5 rounded-full border border-brand/60 bg-brand/30" />
            </div>
            <div className="hidden md:block md:pl-14">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
              {item.subtitle && <p className="mt-1 font-mono text-xs text-muted-foreground">{item.subtitle}</p>}
            </div>
          </div>
          <div className="relative w-full pl-14 md:pl-0">
            <div className="mb-3 md:hidden">
              <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
              {item.subtitle && <p className="font-mono text-xs text-muted-foreground">{item.subtitle}</p>}
            </div>
            {item.content}
          </div>
        </div>
      ))}
      <div
        style={{ height: height + "px" }}
        className="absolute top-0 left-4 w-px overflow-hidden bg-gradient-to-b from-transparent via-border to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_6%,black_94%,transparent_100%)]"
      >
        <motion.div
          style={{ height: heightTransform, opacity: opacityTransform }}
          className="absolute inset-x-0 top-0 w-px rounded-full bg-gradient-to-t from-brand via-brand/60 to-transparent"
        />
      </div>
    </div>
  );
};
