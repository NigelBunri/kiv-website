import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// AllowAny upstream (ChannelLiveStreamListCreateView.get) - unlike
// proxyToDjango(), this must keep working for anonymous viewers, so it
// attaches auth headers only when a session exists rather than 401ing.
// Used by LiveWatchPanel to resolve a ChannelLiveStream row (with its
// real playback_url/status/viewer_count) for a given content_id, since no
// direct "live stream by content_id" lookup exists upstream - only "live
// streams for a channel".
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getValidSession();
  const headers: HeadersInit = auth ? authHeaders(auth.session) : {};
  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(id)}/live-streams/${request.nextUrl.search}`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: upstream.status });
    if (auth?.refreshed) setSessionCookie(response, auth.session);
    return response;
  } catch (error) {
    console.error("kistube live-streams list: fetch failed", error);
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
