"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowRight, ArrowUpRight, Award, Check, Copy, Languages, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/ui/timeline";
import { Reveal, SectionHeading } from "@/components/reveal";
import { ProjectCard } from "@/components/project-card";
import { SocialLinks } from "@/components/social-links";
import { ProjectIcon } from "@/components/project-icon";
import { awards, education, experience, leadership, profile, skills } from "@/data/profile";
import { featuredProjects, projects, sortedProjects } from "@/data/projects";
import { asset } from "@/lib/utils";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
      <SectionHeading index="01" label="About" title="Robots that see, understand and act." />
      <div className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Reveal className="relative">
          <div className="group relative overflow-hidden rounded-2xl border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/media/me.webp")}
              alt="Javier Gil Avilés working with a robot"
              className="aspect-[4/5] w-full object-cover grayscale transition duration-700 group-hover:scale-[1.02] group-hover:grayscale-0"
            />
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/50 px-3 py-2 font-mono text-[11px] text-white/85 backdrop-blur-md">
              <span>{profile.location}</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400" /> available
              </span>
            </div>
          </div>
        </Reveal>
        <div className="flex flex-col gap-6">
          {profile.about.map((p, i) => (
            <Reveal key={i} delay={0.05 * i}>
              <p className="text-lg leading-relaxed text-muted-foreground first:text-foreground">{p}</p>
            </Reveal>
          ))}
          <Reveal delay={0.2}>
            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-4">
              {profile.stats.map((s) => (
                <div key={s.label} className="bg-background p-4">
                  <dt className="text-2xl font-semibold tracking-tight">{s.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.25} className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Languages className="size-4" />
            {profile.languages.map((l) => (
              <span key={l.name}>
                <span className="text-foreground">{l.name}</span> · {l.level}
              </span>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Work() {
  const [first, ...rest] = featuredProjects;
  const others = sortedProjects.filter((p) => !p.featured).slice(0, 6);
  return (
    <section id="work" className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
      <SectionHeading
        index="02"
        label="Selected work"
        title="Things I've built."
        description="Physical-AI hackathon builds, perception pipelines, research and products. Open any card for the full story, media and links."
        action={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/projects">
              All {projects.length} projects <ArrowRight />
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal className="md:col-span-2">
          <ProjectCard project={first} wide />
        </Reveal>
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 2) * 0.08} className="h-full">
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">More projects</h3>
        <ul className="divide-y border-y">
          {others.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/projects/${p.slug}`}
                className="group flex items-center gap-4 py-4 transition-colors hover:bg-muted/40 sm:px-2"
              >
                <ProjectIcon name={p.icon} className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
                <span className="font-medium">{p.title}</span>
                <span className="hidden truncate text-sm text-muted-foreground sm:block">{p.tagline}</span>
                <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{p.date.slice(0, 4)}</span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
      <SectionHeading
        index="03"
        label="Experience"
        title="Industry & research."
        description="From maritime tracking at a robotics lab to middleware used across the ROS 2 ecosystem."
      />
      <Timeline
        data={experience.map((e) => ({
          title: e.company,
          subtitle: `${e.period} · ${e.location}`,
          content: (
            <Reveal className="rounded-2xl border bg-card p-6">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-lg font-semibold tracking-tight">{e.role}</h4>
                {e.href && (
                  <a
                    href={e.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-brand"
                  >
                    {new URL(e.href).hostname.replace("www.", "")}
                    <ArrowUpRight className="size-3" />
                  </a>
                )}
              </div>
              <ul className="space-y-2.5">
                {e.points.map((pt) => (
                  <li key={pt} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-brand" />
                    {pt}
                  </li>
                ))}
              </ul>
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {e.tags.map((t) => (
                  <li key={t} className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          ),
        }))}
      />
    </section>
  );
}

export function Skills() {
  const all = skills.flatMap((g) => g.items);
  return (
    <section id="skills" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading index="04" label="Toolbox" title="Skills & tools." />
      </div>
      <div className="relative mb-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max marquee-track gap-4 hover:[animation-play-state:paused]">
          {[...all, ...all].map((s, i) => (
            <span key={i} className="rounded-full border bg-card px-4 py-2 font-mono text-sm whitespace-nowrap text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl gap-4 px-6 sm:grid-cols-2">
        {skills.map((g, i) => (
          <Reveal key={g.group} delay={(i % 2) * 0.06} className="rounded-2xl border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-medium">
              <span className="font-mono text-xs text-brand">0{i + 1}</span>
              {g.group}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {g.items.map((s) => (
                <motion.li
                  key={s}
                  whileHover={{ y: -2 }}
                  className="rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
                >
                  {s}
                </motion.li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function EducationLeadership() {
  return (
    <section id="education" className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
      <SectionHeading index="05" label="Education & leadership" title="Learning, leading, competing." />
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">Education</h3>
          <ol className="space-y-4">
            {education.map((e, i) => (
              <Reveal key={e.degree} delay={i * 0.05}>
                <li className="rounded-2xl border bg-card p-5">
                  <p className="font-mono text-xs text-muted-foreground">{e.period}</p>
                  <h4 className="mt-1 font-semibold tracking-tight">{e.degree}</h4>
                  <p className="text-sm text-brand">{e.school}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.detail}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">Leadership & community</h3>
          <ol className="space-y-4">
            {leadership.map((l, i) => (
              <Reveal key={l.title} delay={i * 0.05}>
                <li className="rounded-2xl border bg-card p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="font-semibold tracking-tight">{l.title}</h4>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">{l.period}</span>
                  </div>
                  <p className="text-sm text-brand">{l.org}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.detail}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
      <Reveal className="mt-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">Awards & certifications</h3>
        <ul className="divide-y rounded-2xl border bg-card">
          {awards.map((a) => (
            <li key={a.title} className="flex items-start gap-4 p-4 sm:items-center">
              <Award className="mt-0.5 size-4 shrink-0 text-brand sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{a.year}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(profile.email);
    setCopied(true);
    toast.success("Email copied", { description: profile.email });
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
      <Reveal className="relative overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center sm:px-16">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-60" />
        <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative">
          <p className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            <span className="text-brand">06</span> — Contact
          </p>
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Let&apos;s build something that moves.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{profile.openTo} I reply fastest by email.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <a href={`mailto:${profile.email}`}>
                <Mail /> {profile.email}
              </a>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" onClick={copy} aria-label="Copy email">
              {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <SocialLinks className="mt-6 justify-center" />
        </div>
      </Reveal>
    </section>
  );
}
