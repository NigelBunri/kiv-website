import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// JobListingViewSet (apps.commerce.business_views) is IsAuthenticated and
// its get_queryset() already returns every listing, not just the caller's
// own - i.e. it's already a "browse all jobs" endpoint for any signed-in
// member, just not anonymous visitors. KISTube's Jobs page mirrors that:
// sign-in prompt for signed-out visitors, full listing for signed-in ones.
export async function GET(request: NextRequest) {
  return proxyToDjango(request, `/api/v1/business/jobs/${request.nextUrl.search}`, { method: "GET" });
}
