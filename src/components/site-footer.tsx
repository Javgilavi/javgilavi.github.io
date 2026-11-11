import Link from "next/link";
import { SocialLinks } from "@/components/social-links";
import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with Next.js, Tailwind, shadcn/ui & Motion.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
