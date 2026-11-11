"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowRight, Command, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight-new";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { PerceptionField } from "@/components/perception-field";
import { SocialLinks } from "@/components/social-links";
import { useCommandMenu } from "@/components/command-menu";
import { profile } from "@/data/profile";

function RotatingWord({ words }: { words: readonly string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, [words.length]);
  const longest = Math.max(...words.map((w) => w.length));
  // Monospace font: a fixed `ch` width keeps the line from jumping between words.
  return (
    <span
      className="relative inline-block h-[1.5em] overflow-hidden align-bottom"
      style={{ width: `${longest}ch` }}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={words[i]}
          initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 text-brand"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const { open } = useCommandMenu();
  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 hidden dark:block">
        <Spotlight
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(168, 80%, 85%, .07) 0, hsla(168, 80%, 55%, .02) 50%, hsla(168, 80%, 45%, 0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(168, 80%, 85%, .05) 0, hsla(168, 80%, 55%, .015) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(168, 80%, 85%, .03) 0, hsla(168, 80%, 45%, .01) 80%, transparent 100%)"
        />
      </div>
      <PerceptionField className="absolute inset-0 -z-10 h-full w-full mask-fade-b" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background" />

      <div className="mx-auto w-full max-w-5xl px-6 pt-28 pb-20">
        <motion.div {...fade(0.1)} className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-brand" />
          </span>
          Open to internships & roles
          <span className="text-border">|</span>
          <MapPin className="size-3" />
          {profile.location}
        </motion.div>

        <motion.h1 {...fade(0.2)} className="text-5xl font-semibold tracking-tighter text-balance sm:text-7xl">
          {profile.name}
        </motion.h1>

        <motion.p {...fade(0.32)} className="mt-4 font-mono text-sm tracking-tight text-muted-foreground sm:text-base">
          {profile.role} — working on <RotatingWord words={profile.rotating} />
        </motion.p>

        <TextGenerateEffect
          words={profile.headline}
          delay={0.45}
          className="mt-8 max-w-2xl text-xl leading-snug tracking-tight text-foreground/90 sm:text-2xl"
        />

        <motion.div {...fade(0.9)} className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link href="/#work">
              View my work <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full bg-background/50 px-6 backdrop-blur">
            <Link href="/#contact">Get in touch</Link>
          </Button>
          <SocialLinks className="ml-1" />
        </motion.div>

        <motion.button
          {...fade(1.1)}
          onClick={open}
          className="mt-10 hidden items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          Tip: press
          <kbd className="inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            <Command className="size-2.5" />K
          </kbd>
          to jump anywhere
        </motion.button>
      </div>

      <motion.a
        href="#about"
        aria-label="Scroll to about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{ opacity: { delay: 1.4 }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border p-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowDown className="size-4" />
      </motion.a>
    </section>
  );
}
