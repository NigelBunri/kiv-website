import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Staff-only on the Django side (request.user.is_staff) — this proxy adds
// no extra gating, same as every other app/api/control/** route.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; caseId: string }> }) {
  const { id, caseId } = await params;
  return proxyToDjango(
    request,
    `/api/v1/partners/${encodeURIComponent(id)}/verification/cases/${encodeURIComponent(caseId)}/review/`,
    { method: "POST" },
  );
}
