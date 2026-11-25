import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ScrollProgress } from "@/components/scroll-progress";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { profile } from "@/data/profile";
import { ogImage, siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Structured data so search engines can connect this site to the person behind it.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: profile.shortName,
  jobTitle: profile.role,
  description: profile.headline,
  url: siteUrl,
  email: `mailto:${profile.email}`,
  sameAs: Object.values(profile.socials),
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Delft University of Technology" },
    { "@type": "CollegeOrUniversity", name: "University of Seville" },
  ],
  knowsAbout: ["Robotics", "Computer vision", "Sensor fusion", "Physical AI", "Robot learning", "ROS 2"],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} · ${profile.role}`,
    template: `%s · ${profile.shortName}`,
  },
  description: `${profile.headline} ${profile.intro}`,
  keywords: [
    "Javier Gil Avilés",
    "robotics engineer",
    "computer vision",
    "perception",
    "physical AI",
    "sensor fusion",
    "TU Delft",
    "portfolio",
  ],
  authors: [{ name: profile.name, url: profile.socials.github }],
  openGraph: {
    type: "website",
    title: `${profile.name} · ${profile.role}`,
    description: profile.headline,
    url: siteUrl,
    siteName: profile.name,
    images: [ogImage],
  },
  twitter: { card: "summary_large_image", creator: "@Javgilavi_18", images: [ogImage.url] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e12" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <ScrollProgress />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
