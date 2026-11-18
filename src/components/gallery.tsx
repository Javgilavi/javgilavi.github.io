"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Media } from "@/data/projects";
import { ProjectMedia } from "@/components/project-media";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export function Gallery({ items }: { items: Media[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const go = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const current = index !== null ? items[index] : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((m, i) => (
          <Reveal key={m.src + i} delay={(i % 2) * 0.06} className={cn(items.length % 2 === 1 && i === 0 && "sm:col-span-2")}>
            <figure>
              <button
                onClick={() => setIndex(i)}
                className="elevated group relative block aspect-video w-full overflow-hidden rounded-xl border bg-surface"
                aria-label={`Open ${m.alt}`}
              >
                <ProjectMedia
                  media={m}
                  className={cn("transition-transform duration-500 group-hover:scale-[1.02]", m.contain && "bg-white p-3 dark:bg-surface")}
                />
                <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  <Expand className="size-3.5" />
                </span>
              </button>
              {m.caption && <figcaption className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.caption}</figcaption>}
            </figure>
          </Reveal>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent className="max-w-[min(96vw,1200px)] gap-3 border-none bg-transparent p-0 shadow-none sm:max-w-[min(96vw,1200px)]" showCloseButton>
          <DialogTitle className="sr-only">{current?.alt ?? "Media"}</DialogTitle>
          <DialogDescription className="sr-only">{current?.caption ?? ""}</DialogDescription>
          {current && (
            <div className="relative">
              <div className={cn("overflow-hidden rounded-xl", current.contain ? "bg-white dark:bg-neutral-900" : "bg-black")}>
                <div className="max-h-[80vh] [&_img]:max-h-[80vh] [&_video]:max-h-[80vh]">
                  {current.type === "video" ? (
                    <video
                      key={current.src}
                      src={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + current.src}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="mx-auto h-auto max-h-[80vh] w-auto"
                    />
                  ) : (
                    <ProjectMedia media={{ ...current, contain: true }} sizes="natural" className="mx-auto max-h-[80vh] w-auto" />
                  )}
                </div>
              </div>
              {items.length > 1 && (
                <>
                  <button onClick={() => go(-1)} aria-label="Previous" className="absolute top-1/2 left-2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80">
                    <ChevronLeft className="size-5" />
                  </button>
                  <button onClick={() => go(1)} aria-label="Next" className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80">
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
              <div className="mt-3 flex items-start justify-between gap-4 text-sm text-white/85">
                <p>{current.caption ?? current.alt}</p>
                <span className="shrink-0 font-mono text-xs text-white/60">
                  {(index ?? 0) + 1} / {items.length}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
