import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";
import { proxyToDjango } from "@/lib/controlProxy";

// AllowAny for GET (poll results + viewer's own vote if signed in) -
// custom handler since proxyToDjango would hard-401 anonymous viewers.
// POST (casting a vote) does require auth, matching the Django view.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getValidSession();
  const headers: HeadersInit = auth ? authHeaders(auth.session) : {};
  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(id)}/poll/`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: upstream.status });
    if (auth?.refreshed) setSessionCookie(response, auth.session);
    return response;
  } catch (error) {
    console.error("kistube poll GET: fetch failed", error);
    return NextResponse.json({}, { status: 502 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(id)}/poll/`, { method: "POST" });
}
