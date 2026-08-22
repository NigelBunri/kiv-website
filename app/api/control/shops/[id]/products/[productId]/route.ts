import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; productId: string }> }) {
  const { productId } = await params;
  return proxyToDjango(request, `/api/v1/commerce/products/${encodeURIComponent(productId)}/`, { method: "GET" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; productId: string }> }) {
  const { productId } = await params;
  return proxyToDjango(request, `/api/v1/commerce/products/${encodeURIComponent(productId)}/`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; productId: string }> }) {
  const { productId } = await params;
  return proxyToDjango(request, `/api/v1/commerce/products/${encodeURIComponent(productId)}/`, { method: "DELETE" });
}
