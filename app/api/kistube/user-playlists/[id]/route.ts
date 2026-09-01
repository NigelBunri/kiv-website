import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/user-playlists/${encodeURIComponent(id)}/`, { method: "GET" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/user-playlists/${encodeURIComponent(id)}/`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/user-playlists/${encodeURIComponent(id)}/`, { method: "DELETE" });
}
