import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Checks out every item currently in the cart as one MarketplaceOrder -
// same place_marketplace_order() the single-item .../checkout/product
// route and the RN app's own cart checkout (CartDetailPage.handleCheckout)
// both call, just with N items instead of 1. The client sends the items
// it already has from having fetched the cart (same approach the RN app
// uses - it doesn't ask Django to re-derive items from a cart_id either).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const shopId = String(body?.shopId || "").trim();
  const cartId = String(body?.cartId || "").trim();
  const items = Array.isArray(body?.items) ? body.items : [];

  if (!shopId || items.length === 0) {
    return NextResponse.json({ success: false, message: "Your cart is empty." }, { status: 400 });
  }

  const orderItems = items
    .map((item: { productId?: string; quantity?: number }) => ({
      product_id: String(item?.productId || "").trim(),
      quantity: Math.max(1, Number(item?.quantity) || 1),
    }))
    .filter((item: { product_id: string }) => item.product_id);

  if (orderItems.length === 0) {
    return NextResponse.json({ success: false, message: "Your cart is empty." }, { status: 400 });
  }

  const auth = await getValidSession();
  if (!auth) {
    return NextResponse.json({ success: false, message: "Please sign in to check out.", requiresLogin: true }, { status: 401 });
  }
  const { session, refreshed } = auth;

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/commerce/marketplace-orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) },
      body: JSON.stringify({
        shop_id: shopId,
        items: orderItems,
        metadata: cartId ? { source: "website_cart", cart_id: cartId } : { source: "website_cart" },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));

    const response = NextResponse.json(
      upstream.ok
        ? { success: true, paymentUrl: data.payment_url, txRef: data.payment_reference, orderId: data.id }
        : { success: false, message: data?.detail || "Unable to start checkout for your cart." },
      { status: upstream.ok ? 200 : upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("checkout/cart proxy: upstream request failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach checkout. Please try again shortly." }, { status: 502 });
  }
}
