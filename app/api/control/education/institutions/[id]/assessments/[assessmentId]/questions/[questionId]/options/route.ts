import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; assessmentId: string; questionId: string }> }) {
  const { id, assessmentId, questionId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/assessments/${encodeURIComponent(assessmentId)}/questions/${encodeURIComponent(questionId)}/options/`, { method: "POST" });
}
