import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// JobApplicationViewSet.perform_create (apps.commerce.business_views)
// auto-assigns applicant=request.user - body only needs
// {listing, cover_letter?, resume_url?}.
export async function POST(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/business/job-applications/", { method: "POST" });
}
