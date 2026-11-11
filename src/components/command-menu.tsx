"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Briefcase,
  Copy,
  FolderGit2,
  GraduationCap,
  Home,
  Mail,
  Moon,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { sortedProjects } from "@/data/projects";
import { profile } from "@/data/profile";
import { ProjectIcon } from "@/components/project-icon";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/brand-icons";

const CommandMenuContext = createContext<{ open: () => void }>({ open: () => {} });

export const useCommandMenu = () => useContext(CommandMenuContext);

const sections = [
  { id: "top", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "work", label: "Selected work", icon: Sparkles },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education & leadership", icon: GraduationCap },
  { id: "contact", label: "Contact", icon: Mail },
];

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = useCallback((fn: () => void) => {
    setIsOpen(false);
    fn();
  }, []);

  const goSection = (id: string) =>
    run(() => {
      if (window.location.pathname.replace(/\/$/, "").endsWith("/projects") || /\/projects\//.test(window.location.pathname)) {
        router.push(`/#${id}`);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        history.replaceState(null, "", `#${id}`);
      }
    });

  return (
    <CommandMenuContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <CommandDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Command menu"
        description="Jump to a section or project"
      >
        <Command>
        <CommandInput placeholder="Search projects, sections, actions…" />
        <CommandList>
          <CommandEmpty>Nothing found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {sections.map((s) => (
              <CommandItem key={s.id} value={`section ${s.label}`} onSelect={() => goSection(s.id)}>
                <s.icon />
                {s.label}
              </CommandItem>
            ))}
            <CommandItem value="all projects archive" onSelect={() => run(() => router.push("/projects"))}>
              <FolderGit2 />
              All projects
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Projects">
            {sortedProjects.map((p) => (
              <CommandItem
                key={p.slug}
                value={`${p.title} ${p.tagline} ${p.stack.join(" ")} ${p.categories.join(" ")}`}
                onSelect={() => run(() => router.push(`/projects/${p.slug}`))}
              >
                <ProjectIcon name={p.icon} />
                <span className="truncate">{p.title}</span>
                <CommandShortcut className="font-mono">{p.date.slice(0, 4)}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              value="copy email"
              onSelect={() =>
                run(() => {
                  navigator.clipboard?.writeText(profile.email);
                  toast.success("Email copied", { description: profile.email });
                })
              }
            >
              <Copy />
              Copy email
            </CommandItem>
            <CommandItem
              value="toggle theme dark light"
              onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
            >
              {resolvedTheme === "dark" ? <Sun /> : <Moon />}
              Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Elsewhere">
            {[
              { label: "GitHub", href: profile.socials.github, icon: GithubIcon },
              { label: "LinkedIn", href: profile.socials.linkedin, icon: LinkedinIcon },
              { label: "X / Twitter", href: profile.socials.x, icon: XIcon },
            ].map((l) => (
              <CommandItem key={l.label} value={`open ${l.label}`} onSelect={() => run(() => window.open(l.href, "_blank", "noopener"))}>
                <l.icon />
                {l.label}
                <ArrowUpRight className="ml-auto opacity-50" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        </Command>
      </CommandDialog>
    </CommandMenuContext.Provider>
  );
}
