import { NextRequest, NextResponse } from "next/server";

// Proxies a Website Builder page-view beacon to Django's public
// (AllowAny, IP-throttled) beacon endpoint — same server-to-server,
// no-CORS-needed pattern as every other Django call from this repo.
// Fire-and-forget by design: always responds quickly and never surfaces
// an error to the client, since a tracking beacon has nothing for a
// visitor's browser to meaningfully retry or report.
const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const apiBase = (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");

  try {
    await fetch(`${apiBase}/api/v1/websites/public/analytics/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch (error) {
    console.error("website-analytics proxy: upstream request failed", error);
  }

  return new NextResponse(null, { status: 204 });
}
