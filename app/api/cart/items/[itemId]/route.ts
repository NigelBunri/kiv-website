import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Update quantity (PATCH) or remove (DELETE) one cart line item.
// CartItemViewSet.get_queryset already scopes to cart__user=request.user
// on the Django side, so there's no owner check needed here.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const body = await request.json().catch(() => ({}));
  const quantity = Math.max(1, Number(body?.quantity) || 1);

  const auth = await getValidSession();
  if (!auth) {
    return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  }
  const { session, refreshed } = auth;

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/commerce/cart-items/${encodeURIComponent(itemId)}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) },
      body: JSON.stringify({ quantity }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(
      upstream.ok ? { success: true, item: data } : { success: false, message: data?.detail || "Unable to update this item." },
      { status: upstream.ok ? 200 : upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("cart/items PATCH proxy: upstream request failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach your cart. Please try again shortly." }, { status: 502 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;

  const auth = await getValidSession();
  if (!auth) {
    return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  }
  const { session, refreshed } = auth;

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/commerce/cart-items/${encodeURIComponent(itemId)}/`, {
      method: "DELETE",
      headers: authHeaders(session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const response = NextResponse.json(
      { success: upstream.ok || upstream.status === 404 },
      { status: upstream.ok || upstream.status === 404 ? 200 : upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("cart/items DELETE proxy: upstream request failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach your cart. Please try again shortly." }, { status: 502 });
  }
}
