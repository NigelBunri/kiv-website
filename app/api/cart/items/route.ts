import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Adds a product to an existing cart (see ../route.ts for how the cart
// itself is fetched/created first). Proxies straight to CartItemViewSet
// — the same endpoint the RN app's ProductDetailsPage "add to cart"
// already calls in production.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const cartId = String(body?.cartId || "").trim();
  const productId = String(body?.productId || "").trim();
  const quantity = Math.max(1, Number(body?.quantity) || 1);

  if (!cartId || !productId) {
    return NextResponse.json({ success: false, message: "cartId and productId are required." }, { status: 400 });
  }

  const auth = await getValidSession();
  if (!auth) {
    return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  }
  const { session, refreshed } = auth;

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/commerce/cart-items/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) },
      body: JSON.stringify({ cart: cartId, product: productId, quantity }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(
      upstream.ok ? { success: true, item: data } : { success: false, message: data?.detail || firstError(data) || "Unable to add this item to your cart." },
      { status: upstream.ok ? 200 : upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("cart/items POST proxy: upstream request failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach your cart. Please try again shortly." }, { status: 502 });
  }
}

function firstError(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const values = Object.values(data as Record<string, unknown>);
  const first = values[0];
  return Array.isArray(first) ? String(first[0] || "") : typeof first === "string" ? first : "";
}
