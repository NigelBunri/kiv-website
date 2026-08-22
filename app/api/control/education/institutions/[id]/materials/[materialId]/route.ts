import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

function path(id: string, materialId: string) {
  return `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/materials/${encodeURIComponent(materialId)}/`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; materialId: string }> }) {
  const { id, materialId } = await params;
  return proxyToDjango(request, path(id, materialId), { method: "GET" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; materialId: string }> }) {
  const { id, materialId } = await params;
  return proxyToDjango(request, path(id, materialId), { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; materialId: string }> }) {
  const { id, materialId } = await params;
  return proxyToDjango(request, path(id, materialId), { method: "DELETE" });
}
