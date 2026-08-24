import { NextRequest, NextResponse } from "next/server";

// Proxies a Website Builder `form` section submission to Django's public
// (AllowAny, IP-throttled) submit endpoint - same server-to-server,
// no-CORS-needed pattern as payment-status/route.ts. Unauthenticated by
// design: any site visitor can submit, same as a real HTML form post.
const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteSlug: string; pageSlug: string; sectionId: string }> },
) {
  const { siteSlug, pageSlug, sectionId } = await params;
  const body = await request.json().catch(() => ({}));

  const apiBase = (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");
  const upstreamUrl =
    `${apiBase}/api/v1/websites/public/sites/${encodeURIComponent(siteSlug)}` +
    `/pages/${encodeURIComponent(pageSlug)}/forms/${encodeURIComponent(sectionId)}/submit/`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("website-forms proxy: upstream request failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to submit right now. Please try again shortly." },
      { status: 502 },
    );
  }
}
