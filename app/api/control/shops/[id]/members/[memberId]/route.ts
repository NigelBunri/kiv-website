import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const { memberId } = await params;
  return proxyToDjango(request, `/api/v1/commerce/shop-members/${encodeURIComponent(memberId)}/`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const { memberId } = await params;
  return proxyToDjango(request, `/api/v1/commerce/shop-members/${encodeURIComponent(memberId)}/`, { method: "DELETE" });
}
