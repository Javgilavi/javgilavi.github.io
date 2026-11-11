"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Command, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCommandMenu } from "@/components/command-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#about", id: "about", label: "About" },
  { href: "/#work", id: "work", label: "Work" },
  { href: "/#experience", id: "experience", label: "Experience" },
  { href: "/projects", id: "projects", label: "Projects" },
  { href: "/#contact", id: "contact", label: "Contact" },
];

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const ids = ["about", "work", "experience", "education", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id === "education" ? "experience" : e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [enabled]);
  return enabled ? active : null;
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const active = useActiveSection(isHome);
  const current = pathname.startsWith("/projects") ? "projects" : active;
  const { open } = useCommandMenu();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "pointer-events-auto flex w-full max-w-5xl items-center gap-2 rounded-full border px-2 py-1.5 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-border bg-background/70 shadow-lg shadow-black/5 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
      >
        <Link href="/" className="group flex items-center gap-2 rounded-full px-2 py-1" aria-label="Home">
          <span className="grid size-7 place-items-center rounded-full bg-foreground font-mono text-[11px] font-semibold text-background transition-transform group-hover:rotate-[-8deg]">
            JG
          </span>
          <span className="hidden text-sm font-medium tracking-tight sm:inline">Javier Gil</span>
        </Link>

        <ul className="mx-auto hidden items-center md:flex">
          {links.map((l) => (
            <li key={l.id} className="relative">
              <Link
                href={l.href}
                className={cn(
                  "relative z-10 block px-3.5 py-1.5 text-sm transition-colors",
                  current === l.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
              {current === l.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-muted"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={open}
            className="hidden gap-2 rounded-full text-muted-foreground sm:inline-flex"
            aria-label="Open command menu"
          >
            <Command className="size-3.5" />
            <span className="font-mono text-xs">K</span>
          </Button>
          <ThemeToggle />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Menu</SheetTitle>
              </SheetHeader>
              <ul className="flex flex-col gap-1 px-4">
                {links.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-lg tracking-tight hover:bg-muted"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      open();
                    }}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-lg tracking-tight text-muted-foreground hover:bg-muted"
                  >
                    Search…
                  </button>
                </li>
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </motion.nav>
    </header>
  );
}
