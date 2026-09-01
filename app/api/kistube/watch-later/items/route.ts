import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

async function ensureWatchLaterPlaylistId(headers: HeadersInit): Promise<string | null> {
  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/user-playlists/`, {
    method: "POST", headers,
    body: JSON.stringify({ title: "Watch Later", is_system: true, system_key: "watch_later" }),
    cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const data = await res.json().catch(() => ({}));
  return res.ok ? data?.id ?? null : null;
}

export async function POST(request: NextRequest) {
  const auth = await getValidSession();
  if (!auth) return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  const { session, refreshed } = auth;
  const headers = { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) };
  const body = await request.json().catch(() => ({}));
  try {
    const playlistId = await ensureWatchLaterPlaylistId(headers);
    if (!playlistId) return NextResponse.json({ success: false, message: "Unable to save this video." }, { status: 502 });
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/user-playlists/${playlistId}/items/`, {
      method: "POST", headers, body: JSON.stringify({ content_id: body.content_id }),
      cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(upstream.ok ? { success: true, data } : { success: false, message: "Unable to save this video." }, { status: upstream.status });
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("kistube watch-later item POST failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach the server." }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getValidSession();
  if (!auth) return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  const { session, refreshed } = auth;
  const headers = { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) };
  const contentId = request.nextUrl.searchParams.get("content_id");
  try {
    const playlistId = await ensureWatchLaterPlaylistId(headers);
    if (!playlistId) return NextResponse.json({ success: false, message: "Unable to update your saved videos." }, { status: 502 });
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/user-playlists/${playlistId}/items/?content_id=${encodeURIComponent(contentId || "")}`, {
      method: "DELETE", headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const response = NextResponse.json({ success: upstream.ok }, { status: upstream.ok ? 200 : upstream.status });
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("kistube watch-later item DELETE failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach the server." }, { status: 502 });
  }
}
