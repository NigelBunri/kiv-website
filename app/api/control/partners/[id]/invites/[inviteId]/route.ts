import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; inviteId: string }> }) {
  const { id, inviteId } = await params;
  return proxyToDjango(request, `/api/v1/partners/${encodeURIComponent(id)}/invites/${encodeURIComponent(inviteId)}/`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; inviteId: string }> }) {
  const { id, inviteId } = await params;
  return proxyToDjango(request, `/api/v1/partners/${encodeURIComponent(id)}/invites/${encodeURIComponent(inviteId)}/`, { method: "DELETE" });
}
