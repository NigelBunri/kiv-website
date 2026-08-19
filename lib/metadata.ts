import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

type MetaInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  /** Page-specific social preview image, e.g. an existing 1200-wide hero
   * visual. Falls back to the brand logo for routes with no distinct
   * visual of their own (legal pages, utility routes). */
  image?: { url: string; width: number; height: number; alt: string };
  /** Defaults to indexable (existing behavior for every static route).
   * Website Builder pages pass `{ index: false, follow: false }` here —
   * conservative by default until KIS_PUBLIC_WEB_INDEXING_ENABLED is
   * explicitly approved for production, mirroring the Django backend's
   * own default-off indexing stance for its public-web system. */
  robots?: { index: boolean; follow: boolean };
};

const defaultImage = (alt: string) => ({ url: "/images/og-cover.png", width: 1200, height: 630, alt });

export function pageMetadata({ title, description, path, type = "website", image, robots }: MetaInput): Metadata {
  // Root layout.tsx already sets title.template = "%s | Kingdom Impact
  // Ventures", which Next applies to whatever plain-string `title` a page
  // returns here — so this must NOT also append the suffix itself, or
  // every page's browser-tab/SEO title doubles up. openGraph/twitter
  // titles are NOT run through that template (it only merges into the
  // top-level `title` field), so they still need the suffix applied
  // explicitly — using the full name here too, for the same reason.
  const fullTitle = title === site.name ? title : `${title} | ${site.name}`;
  const url = absoluteUrl(path);
  const socialImage = image ?? defaultImage(`${site.name} social preview`);
  return {
    title,
    description,
    alternates: { canonical: url },
    // Explicit rather than relying on Next/Google defaults: max-image-preview
    // "large" is what actually allows Google to show a large logo/preview
    // image in search results instead of a thumbnail-sized one.
    robots: robots ?? {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.name,
      type,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [socialImage.url],
    },
  };
}
