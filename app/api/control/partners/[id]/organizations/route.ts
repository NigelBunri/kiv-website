import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Proxies PartnerViewSet.organizations (apps/partners/views.py) - the
// personal-ownership directory listing (PartnerOrganizationLink), distinct
// from the delegated-management institutions surfaced on the dashboard via
// each entity's own partner_id/partner_name.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/partners/${encodeURIComponent(id)}/organizations/`, { method: "GET" });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/partners/${encodeURIComponent(id)}/organizations/`, { method: "POST" });
}
