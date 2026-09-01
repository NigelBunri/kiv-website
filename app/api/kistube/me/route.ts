import { NextResponse } from "next/server";
import { getKisTubeViewer, setSessionCookie } from "@/lib/kistube-viewer";

// KISTube's own lightweight "who am I" endpoint - deliberately NOT
// lib/controlAuth.ts's fetchControlProfile(), which gates on
// CONTROL_PANEL_MIN_TIER_RANK (Business Pro+). Any signed-in user, on any
// tier, should see their own display name/avatar in the KISTube header -
// that gate only applies to the authenticated admin dashboard at
// /control, an unrelated concern.
export async function GET() {
  const { viewer, refreshedSession } = await getKisTubeViewer();
  const response = NextResponse.json(viewer, { headers: { "Cache-Control": "no-store" } });
  if (refreshedSession) setSessionCookie(response, refreshedSession);
  return response;
}
