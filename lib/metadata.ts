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
};

const defaultImage = (alt: string) => ({ url: "/images/kiv-logo.png", width: 512, height: 512, alt });

export function pageMetadata({ title, description, path, type = "website", image }: MetaInput): Metadata {
  // Root layout.tsx already sets title.template = "%s | KIV", which Next
  // applies to whatever plain-string `title` a page returns here — so this
  // must NOT also append "| KIV" itself, or every page's browser-tab/SEO
  // title doubles up ("... | KIV | KIV"). openGraph/twitter titles are
  // NOT run through that template (it only merges into the top-level
  // `title` field), so they still need the suffix applied explicitly.
  const fullTitle = title === site.name ? title : `${title} | ${site.shortName}`;
  const url = absoluteUrl(path);
  const socialImage = image ?? defaultImage(`${site.name} social preview`);
  return {
    title,
    description,
    alternates: { canonical: url },
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
