import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

function path(id: string, courseId: string, moduleId: string, itemId: string) {
  return `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/items/${encodeURIComponent(itemId)}/`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; courseId: string; moduleId: string; itemId: string }> }) {
  const { id, courseId, moduleId, itemId } = await params;
  return proxyToDjango(request, path(id, courseId, moduleId, itemId), { method: "GET" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; courseId: string; moduleId: string; itemId: string }> }) {
  const { id, courseId, moduleId, itemId } = await params;
  return proxyToDjango(request, path(id, courseId, moduleId, itemId), { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; courseId: string; moduleId: string; itemId: string }> }) {
  const { id, courseId, moduleId, itemId } = await params;
  return proxyToDjango(request, path(id, courseId, moduleId, itemId), { method: "DELETE" });
}
