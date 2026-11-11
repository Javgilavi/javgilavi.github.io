import type { Metadata } from "next";
import { ProjectsExplorer } from "@/components/projects-explorer";
import { Reveal } from "@/components/reveal";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Robotics, perception, physical AI and software projects by Javier Gil Avilés.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-36 pb-24">
      <Reveal className="mb-12">
        <p className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <span className="text-brand">{String(projects.length).padStart(2, "0")}</span> — Projects
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Everything I&apos;ve built.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Hackathon robots, research reproductions, perception pipelines, course projects and products,
          from my bachelor&apos;s in Seville to physical AI in Delft. Filter by area or search by tool.
        </p>
      </Reveal>
      <ProjectsExplorer />
    </div>
  );
}
