"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, LayoutGrid, List, Search, X } from "lucide-react";
import { categories, sortedProjects, type Category } from "@/data/projects";
import { ProjectCard, StackChips } from "@/components/project-card";
import { ProjectIcon } from "@/components/project-icon";
import { cn } from "@/lib/utils";

export function ProjectsExplorer() {
  const [cat, setCat] = useState<Category | "All">("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const counts = useMemo(() => {
    const c = new Map<string, number>([["All", sortedProjects.length]]);
    for (const p of sortedProjects) for (const k of p.categories) c.set(k, (c.get(k) ?? 0) + 1);
    return c;
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sortedProjects.filter((p) => {
      if (cat !== "All" && !p.categories.includes(cat)) return false;
      if (!needle) return true;
      return [p.title, p.tagline, p.context, ...p.stack, ...p.categories].join(" ").toLowerCase().includes(needle);
    });
  }, [cat, q]);

  return (
    <div>
      <div className="sticky top-20 z-30 -mx-2 mb-10 flex flex-col gap-3 rounded-2xl border bg-background/80 p-2 backdrop-blur-xl md:flex-row md:items-center">
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {(["All", ...categories] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "relative shrink-0 rounded-xl px-3 py-1.5 text-sm transition-colors",
                cat === c ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat === c && (
                <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-xl bg-muted" transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />
              )}
              <span className="relative">
                {c} <span className="font-mono text-[10px] text-muted-foreground">{counts.get(c) ?? 0}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <label className="flex flex-1 items-center gap-2 rounded-xl border bg-card px-3 py-1.5 md:w-64 md:flex-none">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stack, topic…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search">
                <X className="size-3.5 text-muted-foreground" />
              </button>
            )}
          </label>
          <div className="flex rounded-xl border bg-card p-0.5">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={`${v} view`}
                className={cn("rounded-lg p-1.5 text-muted-foreground", view === v && "bg-muted text-foreground")}
              >
                {v === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="py-24 text-center text-muted-foreground">No projects match “{q}”.</p>
      )}

      {view === "grid" ? (
        <motion.div layout className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <motion.div
                key={p.slug}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <ul className="divide-y border-y">
          {filtered.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`} className="group grid gap-2 py-5 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-2 hover:bg-muted/30">
                <span className="font-mono text-xs text-muted-foreground">{p.period}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ProjectIcon name={p.icon} className="size-4 text-muted-foreground group-hover:text-brand" />
                    <span className="font-medium">{p.title}</span>
                    <span className="hidden truncate text-sm text-muted-foreground md:inline">— {p.context}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                  <StackChips stack={p.stack} max={5} className="mt-2" />
                </div>
                <ArrowUpRight className="hidden size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand sm:block" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
