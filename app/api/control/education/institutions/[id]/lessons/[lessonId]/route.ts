import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

function path(id: string, lessonId: string) {
  return `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/lessons/${encodeURIComponent(lessonId)}/`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  return proxyToDjango(request, path(id, lessonId), { method: "GET" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  return proxyToDjango(request, path(id, lessonId), { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  return proxyToDjango(request, path(id, lessonId), { method: "DELETE" });
}
