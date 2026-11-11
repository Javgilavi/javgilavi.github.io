import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/brand-icons";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

const items = [
  { label: "GitHub", href: profile.socials.github, Icon: GithubIcon },
  { label: "LinkedIn", href: profile.socials.linkedin, Icon: LinkedinIcon },
  { label: "X", href: profile.socials.x, Icon: XIcon },
  { label: "Email", href: `mailto:${profile.email}`, Icon: Mail },
];

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {items.map(({ label, href, Icon }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" aria-label={label}>
                <Icon className="size-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
