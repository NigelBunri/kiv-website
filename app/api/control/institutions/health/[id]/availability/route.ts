import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// institution_id here is the broadcast-blob institution_uid, not the
// health_ops institution's own primary key - but the two are made to
// match (see StaffWorkspace.tsx / this route's page.tsx), so the same id
// param used everywhere else on the health institution pages works here.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/health-dashboard/institutions/${encodeURIComponent(id)}/availability/`, { method: "GET" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/health-dashboard/institutions/${encodeURIComponent(id)}/availability/`, { method: "PATCH" });
}
