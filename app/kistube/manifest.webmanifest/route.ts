import { NextResponse } from "next/server";
import type { MetadataRoute } from "next";

// Next's manifest.ts file convention only generates a route when placed
// directly at the app root (confirmed: a nested app/kistube/manifest.ts
// produced no /kistube/manifest.webmanifest route in `next build`'s output
// at all) - so this is a plain Route Handler instead, returning the same
// MetadataRoute.Manifest shape by hand. Giving KISTube its own manifest
// (distinct name/icon/start_url/scope from the root app/manifest.ts) means
// "Add to Home Screen" from within KISTube pins KISTube itself, not the
// parent Kingdom Impact Ventures site. Referenced via metadata.manifest in
// app/kistube/layout.tsx.
export async function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: "KISTube",
    short_name: "KISTube",
    description: "Watch with purpose: education, health, market, jobs, feeds and testimonies from the KIS community.",
    start_url: "/kistube",
    scope: "/kistube",
    display: "standalone",
    background_color: "#fffdf7",
    theme_color: "#4b1e8f",
    icons: [
      { src: "/kistube/logo-32.png", sizes: "32x32", type: "image/png" },
      { src: "/kistube/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/kistube/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/kistube/logo-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/kistube/logo-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return NextResponse.json(manifest, { headers: { "Content-Type": "application/manifest+json" } });
}
