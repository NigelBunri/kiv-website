import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

function path(id: string, programId: string) {
  return `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/programs/${encodeURIComponent(programId)}/`;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; programId: string }> }) {
  const { id, programId } = await params;
  return proxyToDjango(request, path(id, programId), { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; programId: string }> }) {
  const { id, programId } = await params;
  return proxyToDjango(request, path(id, programId), { method: "DELETE" });
}
