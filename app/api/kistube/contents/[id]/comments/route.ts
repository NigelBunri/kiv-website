import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";
import { proxyToDjango } from "@/lib/controlProxy";

// GET is AllowAny on the Django side - unlike every app/api/control/**
// route (and unlike POST below), this must keep working for a signed-out
// visitor, so it can't use proxyToDjango's hard 401-if-no-session gate.
// Attaches auth headers only when a session exists, so is_liked still
// resolves correctly for a signed-in viewer.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getValidSession();
  const headers: HeadersInit = { Accept: "application/json" };
  if (auth) Object.assign(headers, authHeaders(auth.session));
  const qs = request.nextUrl.search;
  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(id)}/comments/${qs}`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: upstream.status });
    if (auth?.refreshed) setSessionCookie(response, auth.session);
    return response;
  } catch (error) {
    console.error("kistube comments GET proxy failed", error);
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(id)}/comments/`, { method: "POST" });
}
