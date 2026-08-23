import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

function path(id: string, eventId: string) {
  return `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/events/${encodeURIComponent(eventId)}/`;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
  return proxyToDjango(request, path(id, eventId), { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
  return proxyToDjango(request, path(id, eventId), { method: "DELETE" });
}
