"use client";

import { motion, type HTMLMotionProps } from "motion/react";

export function Reveal({
  delay = 0,
  y = 18,
  children,
  ...props
}: { delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  index,
  label,
  title,
  description,
  action,
}: {
  index: string;
  label: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Reveal className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <span className="text-brand">{index}</span>
          <span className="h-px w-6 bg-border" />
          {label}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 max-w-xl text-muted-foreground">{description}</p>}
      </div>
      {action}
    </Reveal>
  );
}
