import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// AllowAny upstream (LiveStreamViewerPingView) - anonymous viewers count
// too (deduped server-side by user-or-IP). GET returns the cached count,
// POST registers this viewer as active for ~35s.
async function forward(request: NextRequest, id: string, method: "GET" | "POST") {
  const auth = await getValidSession();
  const headers: HeadersInit = auth ? authHeaders(auth.session) : {};
  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/live-streams/${encodeURIComponent(id)}/viewer-ping/`, {
      method, headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: upstream.status });
    if (auth?.refreshed) setSessionCookie(response, auth.session);
    return response;
  } catch (error) {
    console.error("kistube live viewer-ping: fetch failed", error);
    return NextResponse.json({}, { status: 502 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forward(request, id, "GET");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forward(request, id, "POST");
}
