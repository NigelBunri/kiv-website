import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ courseId: string; requestId: string }> }) {
  const { courseId, requestId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/courses/${encodeURIComponent(courseId)}/access-requests/${encodeURIComponent(requestId)}/action/`, { method: "POST" });
}
