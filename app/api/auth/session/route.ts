import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Minimal client-checkable "am I signed in" endpoint — never returns the
// access/refresh tokens themselves (those never leave the httpOnly
// cookie). Used by UserMenu.tsx to decide what to render without needing
// SiteShell (a client component, used on every page) to become async.
export async function GET() {
  const session = await getSession();
  return NextResponse.json({ signedIn: Boolean(session) }, { headers: { "Cache-Control": "no-store" } });
}
