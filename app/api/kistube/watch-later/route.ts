import { NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// "Saved videos" (directive's Saved Videos page) is backed by
// UserContentPlaylist's system-playlist convention
// (is_system=true, system_key="watch_later") - the SAME key the mobile
// app's ensureSystemPlaylist() uses (useChannelsData.ts), so a video
// saved from the website shows up in the app's own Watch Later list for
// the same account and vice versa, rather than establishing a second,
// inconsistent "saved" concept. POST against user-playlists/ is
// idempotent for system playlists (returns the existing one if already
// created), so this ensures-then-fetches in one round trip per call.
export async function GET() {
  const auth = await getValidSession();
  if (!auth) return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  const { session, refreshed } = auth;
  const headers = { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) };
  try {
    const ensure = await fetch(`${kisApiBase()}/api/v1/broadcasts/user-playlists/`, {
      method: "POST", headers,
      body: JSON.stringify({ title: "Watch Later", is_system: true, system_key: "watch_later" }),
      cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const playlist = await ensure.json().catch(() => ({}));
    if (!ensure.ok || !playlist?.id) {
      return NextResponse.json({ success: false, message: "Unable to load your saved videos." }, { status: 502 });
    }
    const itemsRes = await fetch(`${kisApiBase()}/api/v1/broadcasts/user-playlists/${playlist.id}/items/`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const items = await itemsRes.json().catch(() => ({}));
    const response = NextResponse.json({ success: true, data: { playlist, items: items?.results ?? items ?? [] } });
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("kistube watch-later GET failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach the server." }, { status: 502 });
  }
}
