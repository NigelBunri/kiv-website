import { NextRequest, NextResponse } from "next/server";

// Proxies the "Load more" click on a public kis_content section to
// Django's public (AllowAny) load-more endpoint — same server-to-server,
// no-CORS-needed pattern as every other Django call from this repo.
const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteSlug: string; pageSlug: string; sectionId: string }> },
) {
  const { siteSlug, pageSlug, sectionId } = await params;
  const offset = request.nextUrl.searchParams.get("offset") || "0";
  const apiBase = (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");

  const upstreamUrl =
    `${apiBase}/api/v1/websites/public/sites/${encodeURIComponent(siteSlug)}` +
    `/pages/${encodeURIComponent(pageSlug)}/sections/${encodeURIComponent(sectionId)}/more/?offset=${encodeURIComponent(offset)}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("website-kis-content load-more proxy: upstream request failed", error);
    return NextResponse.json({ items: [], has_more: false }, { status: 502 });
  }
}
