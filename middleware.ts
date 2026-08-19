import { NextRequest, NextResponse } from "next/server";

// Custom-domain host routing for the Website Builder — application code
// for a Cloudflare for SaaS setup (Worker-as-origin) that hasn't been
// provisioned yet: apps.websites.custom_domains on the backend never
// marks a domain ACTIVE without that (separate, not-yet-done) zone/
// Worker-route infrastructure step, so in production today this always
// bypasses to NextResponse.next() for every real request — it only
// starts rewriting once a real custom hostname exists and is verified.
//
// kingdomimpactventures.org itself, its subdomains, localhost, and the
// workers.dev preview host are never treated as a custom domain lookup.
const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";
const KNOWN_HOST = "kingdomimpactventures.org";

function isKnownHost(host: string): boolean {
  return (
    !host ||
    host === KNOWN_HOST ||
    host.endsWith(`.${KNOWN_HOST}`) ||
    host === "localhost" ||
    host.endsWith(".workers.dev")
  );
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() || "";
  if (isKnownHost(host)) {
    return NextResponse.next();
  }

  const apiBase = (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");
  try {
    const response = await fetch(`${apiBase}/api/v1/websites/public/sites/by-domain/${encodeURIComponent(host)}/`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return NextResponse.next();

    const data = (await response.json().catch(() => null)) as { slug?: string } | null;
    if (!data?.slug) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = url.pathname === "/" ? `/page/${data.slug}` : `/page/${data.slug}${url.pathname}`;
    return NextResponse.rewrite(url);
  } catch (error) {
    console.error("custom-domain middleware: lookup failed", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)"],
};
