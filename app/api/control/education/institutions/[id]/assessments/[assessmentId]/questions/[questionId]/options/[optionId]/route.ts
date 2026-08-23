import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; assessmentId: string; questionId: string; optionId: string }> }) {
  const { id, assessmentId, questionId, optionId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/assessments/${encodeURIComponent(assessmentId)}/questions/${encodeURIComponent(questionId)}/options/${encodeURIComponent(optionId)}/`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; assessmentId: string; questionId: string; optionId: string }> }) {
  const { id, assessmentId, questionId, optionId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/assessments/${encodeURIComponent(assessmentId)}/questions/${encodeURIComponent(questionId)}/options/${encodeURIComponent(optionId)}/`, { method: "DELETE" });
}
