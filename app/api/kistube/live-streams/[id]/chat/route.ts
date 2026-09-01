import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// AllowAny upstream both ways (ChannelLiveStreamChatHistoryView) - the
// Django view itself accepts anonymous posts (display_name falls back to
// "Anonymous" server-side), so this stays optional-auth rather than
// hard-401ing signed-out chatters.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getValidSession();
  const headers: HeadersInit = auth ? authHeaders(auth.session) : {};
  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/live-streams/${encodeURIComponent(id)}/chat/${request.nextUrl.search}`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: upstream.status });
    if (auth?.refreshed) setSessionCookie(response, auth.session);
    return response;
  } catch (error) {
    console.error("kistube live chat GET: fetch failed", error);
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getValidSession();
  const headers: HeadersInit = { "Content-Type": "application/json", ...(auth ? authHeaders(auth.session) : {}) };
  const body = await request.json().catch(() => ({}));
  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/live-streams/${encodeURIComponent(id)}/chat/`, {
      method: "POST", headers, body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: upstream.status });
    if (auth?.refreshed) setSessionCookie(response, auth.session);
    return response;
  } catch (error) {
    console.error("kistube live chat POST: fetch failed", error);
    return NextResponse.json({ message: "Unable to reach the server." }, { status: 502 });
  }
}
