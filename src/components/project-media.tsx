"use client";

import { useEffect, useRef } from "react";
import type { IconKey, Media } from "@/data/projects";
import { ProjectIcon } from "@/components/project-icon";
import { asset, cn } from "@/lib/utils";

/** Video that only plays while on screen (saves bandwidth and battery). */
function InViewVideo({ media, className }: { media: Media; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={asset(media.src)}
      poster={media.poster ? asset(media.poster) : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-label={media.alt}
      className={className}
    />
  );
}

export function ProjectMedia({
  media,
  className,
  sizes = "cover",
}: {
  media: Media;
  className?: string;
  sizes?: "cover" | "natural";
}) {
  const fit = media.contain ? "object-contain" : "object-cover";
  const common = cn(
    sizes === "cover" ? "h-full w-full" : "h-auto w-full",
    fit,
    media.pixelated && "[image-rendering:pixelated]",
    className
  );
  if (media.type === "video") return <InViewVideo media={media} className={common} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={asset(media.src)} alt={media.alt} loading="lazy" decoding="async" className={common} />;
}

/** Fallback cover for projects without imagery: grid, glow and the project icon. */
export function GeneratedCover({ icon, title, className }: { icon: IconKey; title: string; className?: string }) {
  return (
    <div className={cn("relative grid h-full w-full place-items-center overflow-hidden bg-surface", className)}>
      <div className="absolute inset-0 bg-grid mask-radial opacity-70" />
      <div className="absolute size-48 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative flex flex-col items-center gap-3">
        <div className="grid size-14 place-items-center rounded-2xl border bg-background/70 shadow-sm backdrop-blur">
          <ProjectIcon name={icon} className="size-6 text-brand" strokeWidth={1.5} />
        </div>
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{title}</span>
      </div>
    </div>
  );
}
