import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// ChannelContentViewEventView is AllowAny on Django - an anonymous
// visitor's view still counts toward stats.views. When a session exists,
// forwarding auth headers is what makes Django also upsert
// ChannelWatchHistory for that user (the real "watch history" write
// path - see lib/kistube-api.ts's recordContentView doc comment). Never
// gated behind requiring sign-in, unlike every proxyToDjango-based route.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getValidSession();
  const headers: HeadersInit = { "Content-Type": "application/json", Accept: "application/json" };
  if (auth) Object.assign(headers, authHeaders(auth.session));
  const body = await request.json().catch(() => ({}));
  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(id)}/view/`, {
      method: "POST", headers, body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: upstream.status });
    if (auth?.refreshed) setSessionCookie(response, auth.session);
    return response;
  } catch (error) {
    console.error("kistube view-event proxy failed", error);
    return NextResponse.json({}, { status: 502 });
  }
}
