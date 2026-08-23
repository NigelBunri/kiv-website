import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ playlistId: string; contentId: string }> }) {
  const { playlistId, contentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/playlists/${encodeURIComponent(playlistId)}/items/${encodeURIComponent(contentId)}/`, { method: "DELETE" });
}
