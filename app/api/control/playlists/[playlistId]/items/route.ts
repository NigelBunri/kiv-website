import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ playlistId: string }> }) {
  const { playlistId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/playlists/${encodeURIComponent(playlistId)}/items/`, { method: "POST" });
}

// Also used for shuffle_enabled setting updates and item reordering - the
// backend overloads this single PATCH endpoint for both, keyed by which
// body field is present ({"shuffle_enabled": bool} vs {"order": [...]}).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ playlistId: string }> }) {
  const { playlistId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/playlists/${encodeURIComponent(playlistId)}/items/`, { method: "PATCH" });
}
