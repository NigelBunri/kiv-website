import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Locks shop_id to the route param and only ever allows product-image
// purposes — never trust the browser to name its own shop/purpose for an
// upload handshake.
const ALLOWED_PURPOSES = new Set(["product_main_image", "product_gallery_image", "shop_logo"]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getValidSession();
  if (!auth) return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  const { session, refreshed } = auth;

  const body = await request.json().catch(() => ({}));
  const purpose = ALLOWED_PURPOSES.has(String(body?.purpose || "")) ? String(body.purpose) : "product_main_image";

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/commerce/uploads/initiate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) },
      body: JSON.stringify({
        purpose,
        filename: body?.filename,
        content_type: body?.content_type,
        size_bytes: body?.size_bytes,
        shop_id: id,
        product_id: body?.product_id || undefined,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(
      upstream.ok ? { success: true, data } : { success: false, message: data?.detail || "Unable to start the upload.", errors: data },
      { status: upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("commerce upload initiate proxy failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach the server. Please try again shortly." }, { status: 502 });
  }
}
