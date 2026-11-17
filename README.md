# Javier Gil Avilés — Portfolio

Personal portfolio of **Javier Gil Avilés**, Perception & AI Robotics Engineer (MSc Robotics, TU Delft).

**Live:** https://javgilavi.github.io/

## Stack

- [Next.js](https://nextjs.org) (App Router, static export) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (Radix): button, dialog, command, sheet, tooltip, sonner…
- [Aceternity UI](https://ui.aceternity.com): spotlight, text-generate effect, glowing card border, scroll timeline
- [Motion](https://motion.dev) for reveal, layout and page animations
- A custom canvas "perception field" in the hero: LiDAR-style scan rings, a sweeping beam and live detections

## Features

- Dark / light theme, `⌘K` / `Ctrl+K` command menu to jump to any section or project
- Projects explorer with category filters, search and grid / list views
- A detail page per project: overview, results, highlights, stack, links and a gallery with lightbox
- Videos only play while they are on screen; reduced-motion users get static visuals
- Sitemap, robots.txt, canonical URLs, JSON-LD and a link-preview image (`public/og.png`) for search and sharing

## Editing content

All content lives in two typed files:

| File | What |
| --- | --- |
| `src/data/profile.ts` | bio, stats, experience, education, leadership, awards, skills, socials |
| `src/data/projects.ts` | every project: text, results, stack, links, cover and gallery media |

Media lives in `public/media/<project>/`. Use WebP for images (≤1600 px wide) and short muted
H.264 MP4 loops with a `-poster.webp`, for example:

```bash
ffmpeg -i input.png -vf "scale='min(1600,iw)':-2" -c:v libwebp -quality 80 public/media/my-project/cover.webp
ffmpeg -ss 0 -t 10 -i input.mp4 -an -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 -pix_fmt yuv420p -movflags +faststart public/media/my-project/clip.mp4
```

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # static export to ./out
```

## Deployment

Every push to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.
The workflow picks the base path from the repo name: a repo named `<user>.github.io` is served
from the domain root (`NEXT_PUBLIC_BASE_PATH=""`), any other repo as a project page under
`/<repo-name>`. For a custom domain, set `NEXT_PUBLIC_BASE_PATH` to an empty string.
