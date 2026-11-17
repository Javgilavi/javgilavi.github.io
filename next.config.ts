import type { NextConfig } from "next";

// Deployed to GitHub Pages. CI sets this to "" for the <user>.github.io repo (served at the
// domain root) and to /<repo-name> for any other repo (served as a project page).
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
