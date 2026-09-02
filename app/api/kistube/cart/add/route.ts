import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// "Add to cart" needs two Django calls composed into one: apps.commerce's
// Cart model is one-active-cart-per-shop-per-user (CartViewSet.perform_create
// 400s if one already exists), and there's no single "get or create my cart
// for this shop" endpoint - CartViewSet.current 404s when none exists yet.
// Mirrors watch-later/route.ts's ensure-then-fetch shape: try `current`,
// fall back to create, then add the item. Custom handler (not
// proxyToDjango) because it's two upstream calls, not a 1:1 passthrough.
export async function POST(request: NextRequest) {
  const auth = await getValidSession();
  if (!auth) return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  const { session, refreshed } = auth;
  const headers = { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) };

  const body = await request.json().catch(() => ({}));
  const productId = String(body?.product_id || "").trim();
  const shopId = String(body?.shop_id || "").trim();
  const quantity = Math.max(1, Number(body?.quantity) || 1);
  if (!productId || !shopId) {
    return NextResponse.json({ success: false, message: "product_id and shop_id are required." }, { status: 400 });
  }

  try {
    let cart: { id?: string } = {};
    const current = await fetch(`${kisApiBase()}/api/v1/commerce/carts/current/?shop_id=${encodeURIComponent(shopId)}`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    if (current.ok) {
      cart = await current.json().catch(() => ({}));
    }
    if (!cart?.id) {
      const created = await fetch(`${kisApiBase()}/api/v1/commerce/carts/`, {
        method: "POST", headers,
        body: JSON.stringify({ shop: shopId }),
        cache: "no-store", signal: AbortSignal.timeout(15_000),
      });
      cart = await created.json().catch(() => ({}));
      if (!created.ok || !cart?.id) {
        return NextResponse.json({ success: false, message: (cart as { detail?: string })?.detail || "Couldn't start a cart for this shop." }, { status: 502 });
      }
    }

    const itemRes = await fetch(`${kisApiBase()}/api/v1/commerce/cart-items/`, {
      method: "POST", headers,
      body: JSON.stringify({ cart: cart.id, product: productId, quantity }),
      cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const item = await itemRes.json().catch(() => ({}));
    const response = NextResponse.json(
      itemRes.ok ? { success: true, data: item } : { success: false, message: item?.detail || item?.quantity?.[0] || item?.product?.[0] || "Couldn't add that to your cart.", errors: item },
      { status: itemRes.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("kistube cart/add failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach the server. Please try again shortly." }, { status: 502 });
  }
}
