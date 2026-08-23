import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; assessmentId: string }> }) {
  const { id, assessmentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/assessments/${encodeURIComponent(assessmentId)}/`, { method: "GET" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; assessmentId: string }> }) {
  const { id, assessmentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/assessments/${encodeURIComponent(assessmentId)}/`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; assessmentId: string }> }) {
  const { id, assessmentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/assessments/${encodeURIComponent(assessmentId)}/`, { method: "DELETE" });
}
