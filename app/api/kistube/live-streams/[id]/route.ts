import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// AllowAny upstream for public channels (ChannelLiveStreamDetailView) -
// polled by LiveWatchPanel every ~15s for status/viewer_count/playback_url.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getValidSession();
  const headers: HeadersInit = auth ? authHeaders(auth.session) : {};
  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/live-streams/${encodeURIComponent(id)}/`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: upstream.status });
    if (auth?.refreshed) setSessionCookie(response, auth.session);
    return response;
  } catch (error) {
    console.error("kistube live-stream detail: fetch failed", error);
    return NextResponse.json({}, { status: 502 });
  }
}
