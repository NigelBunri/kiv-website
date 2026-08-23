import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; assessmentId: string; submissionId: string }> }) {
  const { id, assessmentId, submissionId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/assessments/${encodeURIComponent(assessmentId)}/submissions/${encodeURIComponent(submissionId)}/action/`, { method: "POST" });
}
