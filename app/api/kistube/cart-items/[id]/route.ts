import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Plain passthroughs - CartItemViewSet already enforces ownership via
// get_queryset (filter(cart__user=request.user)) and re-validates quantity
// against stock on write, nothing extra needed here.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/commerce/cart-items/${encodeURIComponent(id)}/`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/commerce/cart-items/${encodeURIComponent(id)}/`, { method: "DELETE" });
}
