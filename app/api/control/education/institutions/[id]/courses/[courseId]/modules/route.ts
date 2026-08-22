import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; courseId: string }> }) {
  const { id, courseId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/courses/${encodeURIComponent(courseId)}/modules/`, { method: "GET" });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; courseId: string }> }) {
  const { id, courseId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/courses/${encodeURIComponent(courseId)}/modules/`, { method: "POST" });
}
