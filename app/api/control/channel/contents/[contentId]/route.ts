import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/`, { method: "DELETE" });
}
