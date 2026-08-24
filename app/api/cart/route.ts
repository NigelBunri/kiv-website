import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Fetches (or creates) the visitor's active cart for one shop. Same
// Cart/CartItem models the RN mobile app's own per-shop cart already
// uses in production (apps.commerce.models.Cart, CartViewSet) - this
// adds no new backend logic, only a signed-in-visitor entry surface,
// same pattern as app/api/checkout/product/route.ts.
export async function GET(request: NextRequest) {
  const shopId = request.nextUrl.searchParams.get("shopId")?.trim();
  if (!shopId) {
    return NextResponse.json({ success: false, message: "shopId is required." }, { status: 400 });
  }

  const auth = await getValidSession();
  if (!auth) {
    return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true, cart: null }, { status: 401 });
  }
  const { session, refreshed } = auth;

  try {
    const headers = { Accept: "application/json", ...authHeaders(session) };
    const current = await fetch(`${kisApiBase()}/api/v1/commerce/carts/current/?shop_id=${encodeURIComponent(shopId)}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (current.status === 404) {
      // No cart exists yet for this shop - create one. Matches
      // CartViewSet.perform_create: one active cart per (user, shop).
      const created = await fetch(`${kisApiBase()}/api/v1/commerce/carts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ shop: shopId }),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      const createdData = await created.json().catch(() => ({}));
      const response = NextResponse.json(
        created.ok ? { success: true, cart: createdData } : { success: false, message: createdData?.detail || "Unable to start a cart." },
        { status: created.ok ? 200 : created.status },
      );
      if (refreshed) setSessionCookie(response, session);
      return response;
    }

    const data = await current.json().catch(() => ({}));
    const response = NextResponse.json(
      current.ok ? { success: true, cart: data } : { success: false, message: data?.detail || "Unable to load your cart." },
      { status: current.ok ? 200 : current.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("cart GET proxy: upstream request failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach your cart. Please try again shortly." }, { status: 502 });
  }
}
