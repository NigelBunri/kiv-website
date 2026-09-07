import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// GET added for the channel-video processing-status poll (see
// ChannelWorkspace.tsx) - Django's ChannelContentDetailView.get is
// AllowAny (view-permission gated separately per-content, not auth-gated),
// but this proxy still goes through proxyToDjango, which requires a signed-
// in session same as every other control-panel proxy for consistency.
export async function GET(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/`, { method: "GET" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/`, { method: "DELETE" });
}
