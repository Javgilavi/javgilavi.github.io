// Canonical site URL. CI sets NEXT_PUBLIC_SITE_URL, including the base path for project pages.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://javgilavi.github.io").replace(/\/$/, "");

// Link-preview image. Next resolves it against metadataBase, so no base path here.
export const ogImage = { url: "/og.png", width: 1200, height: 630, alt: "Javier Gil Avilés · Perception & AI Robotics Engineer" };
