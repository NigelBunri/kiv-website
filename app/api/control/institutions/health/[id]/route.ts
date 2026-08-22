import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// HealthInstitutionDetailView (apps/health_ops/views.py) only implements
// GET today — no PATCH exists on the backend, so this control-panel page
// is read-only for name/description until that's added.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/health-ops/institutions/${encodeURIComponent(id)}/`, { method: "GET" });
}
