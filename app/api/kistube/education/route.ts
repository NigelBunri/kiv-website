import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// EducationDiscoveryView (apps.broadcasts) is IsAuthenticated, not AllowAny
// - matches this backend's existing posture for rich discovery surfaces
// (as opposed to public per-item landing pages). The KISTube Education
// page shows a sign-in prompt (kt-authgate) for signed-out visitors rather
// than adding a new public endpoint that doesn't exist upstream.
export async function GET(request: NextRequest) {
  return proxyToDjango(request, `/api/v1/education/discovery/${request.nextUrl.search}`, { method: "GET" });
}
