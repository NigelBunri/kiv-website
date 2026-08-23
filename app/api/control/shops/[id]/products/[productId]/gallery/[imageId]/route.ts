import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; productId: string; imageId: string }> }) {
  const { productId, imageId } = await params;
  return proxyToDjango(request, `/api/v1/commerce/products/${encodeURIComponent(productId)}/gallery/${encodeURIComponent(imageId)}/`, { method: "DELETE" });
}
