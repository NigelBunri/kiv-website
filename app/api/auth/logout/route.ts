import { NextResponse } from "next/server";
import { authHeaders, clearSessionCookie, getSession, kisApiBase } from "@/lib/session";

// Revokes the current browser's Device row server-side (same mechanism
// mobile logout uses - LogoutView bumps Device.token_version and sets
// revoked_at), then clears the session cookie. Best-effort: the cookie is
// cleared regardless of whether the upstream revoke call succeeds, so a
// user is never stuck "logged in" locally just because Django was
// unreachable.
export async function POST() {
  const session = await getSession();

  if (session) {
    try {
      await fetch(`${kisApiBase()}/api/v1/auth/logout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(session) },
        body: JSON.stringify({ refresh: session.refresh }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      console.error("auth/logout proxy: upstream revoke failed (clearing local session anyway)", error);
    }
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
