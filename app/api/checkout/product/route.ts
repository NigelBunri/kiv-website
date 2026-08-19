import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Buy a product from a Website Builder page. Reuses the exact same
// service function the mobile app's checkout hits (place_marketplace_order
// via MarketplaceOrderViewSet.create) — this handler adds no business
// logic, only a signed-in-visitor entry surface. Returns a Flutterwave
// hosted payment_url; the browser redirects there directly (this
// codebase's only checkout UI pattern — no card collection happens here
// or on Django).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const shopId = String(body?.shopId || "").trim();
  const productId = String(body?.productId || "").trim();
  const quantity = Math.max(1, Number(body?.quantity) || 1);

  if (!shopId || !productId) {
    return NextResponse.json({ success: false, message: "shopId and productId are required." }, { status: 400 });
  }

  const auth = await getValidSession();
  if (!auth) {
    return NextResponse.json({ success: false, message: "Please sign in to complete your purchase.", requiresLogin: true }, { status: 401 });
  }
  const { session, refreshed } = auth;

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/commerce/marketplace-orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) },
      body: JSON.stringify({ shop_id: shopId, items: [{ product_id: productId, quantity }] }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));

    const response = NextResponse.json(
      upstream.ok
        ? { success: true, paymentUrl: data.payment_url, txRef: data.payment_reference, orderId: data.id }
        : { success: false, message: data?.detail || "Unable to start checkout for this product." },
      { status: upstream.ok ? 200 : upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("checkout/product proxy: upstream request failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach checkout. Please try again shortly." }, { status: 502 });
  }
}
