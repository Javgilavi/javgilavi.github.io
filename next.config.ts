import type { NextConfig } from "next";

// Deployed to GitHub Pages. CI reads the Pages URL and sets this to "" when the site is served
// at a domain root (custom domain or <user>.github.io) and to /<repo-name> for a project page.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
