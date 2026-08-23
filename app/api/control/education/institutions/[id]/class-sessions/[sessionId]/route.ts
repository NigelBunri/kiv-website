import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

function path(id: string, sessionId: string) {
  return `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/class-sessions/${encodeURIComponent(sessionId)}/`;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = await params;
  return proxyToDjango(request, path(id, sessionId), { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = await params;
  return proxyToDjango(request, path(id, sessionId), { method: "DELETE" });
}
