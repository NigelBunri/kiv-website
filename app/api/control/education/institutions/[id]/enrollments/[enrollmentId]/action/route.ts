import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; enrollmentId: string }> }) {
  const { id, enrollmentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/enrollments/${encodeURIComponent(enrollmentId)}/action/`, { method: "POST" });
}
