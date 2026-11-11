import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink, FileText, Globe, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { Gallery } from "@/components/gallery";
import { GeneratedCover, ProjectMedia } from "@/components/project-media";
import { ProjectIcon } from "@/components/project-icon";
import { GithubIcon } from "@/components/brand-icons";
import { getProject, projects, sortedProjects, type LinkKind } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.tagline,
    openGraph: { title: p.title, description: p.tagline },
  };
}

const linkIcon: Record<LinkKind, React.ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  live: Globe,
  video: PlayCircle,
  paper: FileText,
  external: ExternalLink,
};

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const i = sortedProjects.findIndex((x) => x.slug === p.slug);
  const prev = sortedProjects[(i - 1 + sortedProjects.length) % sortedProjects.length];
  const next = sortedProjects[(i + 1) % sortedProjects.length];
  const gallery = (p.gallery ?? []).filter((g) => g.src !== p.cover?.src);

  const meta = [
    { k: "Period", v: p.period },
    { k: "Context", v: p.context },
    { k: "My role", v: p.role },
    ...(p.team ? [{ k: "Team", v: p.team }] : []),
  ];

  return (
    <article className="mx-auto max-w-5xl px-6 pt-32 pb-24">
      <Reveal>
        <Link href="/projects" className="group mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> All projects
        </Link>
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg border bg-card">
            <ProjectIcon name={p.icon} className="size-4 text-brand" />
          </span>
          {p.categories.map((c) => (
            <span key={c} className="rounded-full border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter text-balance sm:text-6xl">{p.title}</h1>
        <p className="mt-4 max-w-3xl text-xl leading-snug text-muted-foreground text-balance">{p.tagline}</p>
        {p.links && (
          <div className="mt-8 flex flex-wrap gap-2">
            {p.links.map((l, idx) => {
              const Icon = linkIcon[l.kind];
              return (
                <Button key={l.href} asChild variant={idx === 0 ? "default" : "outline"} className="rounded-full">
                  <a href={l.href} target="_blank" rel="noopener noreferrer">
                    <Icon className="size-4" /> {l.label} <ArrowUpRight className="size-3.5 opacity-60" />
                  </a>
                </Button>
              );
            })}
          </div>
        )}
      </Reveal>

      <Reveal delay={0.1} className="mt-12 overflow-hidden rounded-2xl border bg-surface">
        <div className="aspect-video">
          {p.cover ? (
            <ProjectMedia media={p.cover} className={p.cover.contain ? "bg-white p-6 dark:bg-surface" : ""} />
          ) : (
            <GeneratedCover icon={p.icon} title={p.context} />
          )}
        </div>
      </Reveal>

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-14">
          <section>
            <h2 className="mb-5 font-mono text-xs tracking-widest text-muted-foreground uppercase">Overview</h2>
            <div className="space-y-5">
              {p.overview.map((para, k) => (
                <Reveal key={k} delay={k * 0.04}>
                  <p className="text-lg leading-relaxed text-foreground/85">{para}</p>
                </Reveal>
              ))}
            </div>
          </section>

          {p.results && (
            <section>
              <h2 className="mb-5 font-mono text-xs tracking-widest text-muted-foreground uppercase">Results</h2>
              <dl className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-3">
                {p.results.map((r) => (
                  <Reveal key={r.label} className="bg-card p-5">
                    <dt className="font-mono text-3xl font-semibold tracking-tight text-brand">{r.value}</dt>
                    <dd className="mt-2 text-sm leading-snug text-muted-foreground">{r.label}</dd>
                  </Reveal>
                ))}
              </dl>
            </section>
          )}

          <section>
            <h2 className="mb-5 font-mono text-xs tracking-widest text-muted-foreground uppercase">Highlights</h2>
            <ul className="space-y-3">
              {p.highlights.map((h, k) => (
                <Reveal key={h} delay={k * 0.03}>
                  <li className="flex gap-4 rounded-xl border bg-card p-4 text-sm leading-relaxed">
                    <span className="font-mono text-xs text-brand">{String(k + 1).padStart(2, "0")}</span>
                    <span className="text-foreground/85">{h}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </section>

          {gallery.length > 0 && (
            <section>
              <h2 className="mb-5 font-mono text-xs tracking-widest text-muted-foreground uppercase">Gallery</h2>
              <Gallery items={gallery} />
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Reveal className="rounded-2xl border bg-card p-5">
            <dl className="space-y-4">
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">{m.k}</dt>
                  <dd className="mt-1 text-sm leading-relaxed">{m.v}</dd>
                </div>
              ))}
              <div>
                <dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">Stack</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <span key={s} className="rounded-md border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </Reveal>
        </aside>
      </div>

      <nav className="mt-24 grid gap-4 border-t pt-10 sm:grid-cols-2">
        <Link href={`/projects/${prev.slug}`} className="group rounded-2xl border p-5 transition-colors hover:bg-muted/40">
          <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> Newer
          </span>
          <span className="mt-2 block font-medium">{prev.title}</span>
        </Link>
        <Link href={`/projects/${next.slug}`} className="group rounded-2xl border p-5 text-right transition-colors hover:bg-muted/40">
          <span className="flex items-center justify-end gap-2 font-mono text-xs text-muted-foreground">
            Older <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="mt-2 block font-medium">{next.title}</span>
        </Link>
      </nav>
    </article>
  );
}
