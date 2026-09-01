import type { Metadata } from "next";
import { pageMetadata } from "./metadata";

// Thin wrapper around the site-wide pageMetadata() helper (lib/metadata.ts)
// that defaults every KISTube page's social preview to the KISTube brand
// card instead of the KIV corporate logo, and defaults to noindex until
// public indexing is explicitly turned on - see kistubeRobots() below for
// why that default exists and is not a placeholder oversight.
const KISTUBE_OG_IMAGE = { url: "/kistube/og-cover.png", width: 1200, height: 630, alt: "KISTube — Watch with purpose." };

export function kistubeMetadata(input: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: { url: string; width: number; height: number; alt: string };
  robots?: { index: boolean; follow: boolean };
}): Metadata {
  return pageMetadata({ ...input, image: input.image ?? KISTUBE_OG_IMAGE });
}

// KISTube surfaces the exact same underlying broadcast/channel content the
// Django backend already treats as not-yet-approved-for-indexing by
// default (apps/core/public_web.py: KIS_PUBLIC_WEB_INDEXING_ENABLED
// defaults to False, and every public broadcast/channel landing payload
// already carries its own seo.robots value reflecting that same flag).
// Mirroring that stance here - rather than indexing eagerly and hoping a
// human notices later - means KISTube's SEO plumbing (metadata,
// structured data, sitemap entries) is fully built and correct the
// moment indexing is approved, without a code change; only the env var
// flips. See docs/kistube.md "Indexing" for how to turn this on.
export function kistubeIndexingEnabled(): boolean {
  return String(process.env.NEXT_PUBLIC_KISTUBE_INDEXING_ENABLED || "").trim().toLowerCase() === "true";
}

export function kistubeRobots(overrideIndexable?: boolean): { index: boolean; follow: boolean } {
  const index = overrideIndexable ?? kistubeIndexingEnabled();
  return { index, follow: index };
}
