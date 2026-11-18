import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GeneratedCover, ProjectMedia } from "@/components/project-media";
import { cn } from "@/lib/utils";

export function StackChips({ stack, max = 4, className }: { stack: string[]; max?: number; className?: string }) {
  const shown = stack.slice(0, max);
  const rest = stack.length - shown.length;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((s) => (
        <li key={s} className="rounded-full border bg-background/60 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          {s}
        </li>
      ))}
      {rest > 0 && (
        <li className="rounded-full px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">+{rest}</li>
      )}
    </ul>
  );
}

export function ProjectCard({ project, wide = false }: { project: Project; wide?: boolean }) {
  return (
    <div className={cn("elevated relative h-full min-w-0 rounded-2xl border bg-card/50 p-1.5 dark:bg-transparent", wide && "md:col-span-2")}>
      <GlowingEffect spread={40} glow={false} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
      <Link
        href={`/projects/${project.slug}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-border/60 transition-shadow hover:shadow-xl hover:shadow-black/5",
          wide && "md:flex-row"
        )}
      >
        <div className={cn("relative aspect-[16/10] overflow-hidden bg-surface", wide && "md:aspect-auto md:w-3/5")}>
          <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
            {project.cover ? (
              <ProjectMedia media={project.cover} className={project.cover.contain ? "bg-white p-4 dark:bg-surface" : ""} />
            ) : (
              <GeneratedCover icon={project.icon} title={project.title} />
            )}
          </div>
          <span className="absolute top-3 left-3 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 font-mono text-[10px] tracking-wider text-white/90 uppercase backdrop-blur-md">
            {project.categories[0]}
          </span>
        </div>
        <div className={cn("flex flex-1 flex-col gap-3 p-5", wide && "md:justify-center md:p-8")}>
          <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground">
            <span className="truncate">{project.context}</span>
            <span className="shrink-0">{project.period}</span>
          </div>
          <h3 className={cn("flex items-start gap-2 text-xl font-semibold tracking-tight", wide && "md:text-3xl")}>
            {project.title}
            <ArrowUpRight className="mt-1 size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-brand group-hover:opacity-100" />
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{project.tagline}</p>
          {wide && project.results && (
            <dl className="mt-2 hidden grid-cols-3 gap-4 border-t pt-4 md:grid">
              {project.results.map((r) => (
                <div key={r.label}>
                  <dt className="font-mono text-lg font-semibold text-brand">{r.value}</dt>
                  <dd className="text-xs leading-snug text-muted-foreground">{r.label}</dd>
                </div>
              ))}
            </dl>
          )}
          <StackChips stack={project.stack} className="mt-auto pt-2" max={wide ? 6 : 4} />
        </div>
      </Link>
    </div>
  );
}
