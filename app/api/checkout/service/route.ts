import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Book a service from a Website Builder page. Reuses
// ServiceBookingViewSet.create exactly as the mobile app does — same
// reasoning as the product checkout route. scheduledAt must be an ISO
// datetime string chosen by the visitor (the section's UI is responsible
// for offering a real slot picker; this route trusts nothing about
// availability beyond what Django itself validates).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const serviceId = String(body?.serviceId || "").trim();
  const scheduledAt = String(body?.scheduledAt || "").trim();

  if (!serviceId || !scheduledAt) {
    return NextResponse.json({ success: false, message: "serviceId and scheduledAt are required." }, { status: 400 });
  }

  const auth = await getValidSession();
  if (!auth) {
    return NextResponse.json({ success: false, message: "Please sign in to book this service.", requiresLogin: true }, { status: 401 });
  }
  const { session, refreshed } = auth;

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/commerce/service-bookings/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) },
      body: JSON.stringify({ service_id: serviceId, scheduled_at: scheduledAt, terms_accepted: true }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const metadata = (data && typeof data.metadata === "object" && data.metadata) || {};

    const response = NextResponse.json(
      upstream.ok
        ? { success: true, paymentUrl: metadata.payment_url || null, txRef: metadata.payment_reference || null, bookingId: data.id }
        : { success: false, message: data?.detail || (Array.isArray(data) ? data.join(" ") : "Unable to book this service.") },
      { status: upstream.ok ? 200 : upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("checkout/service proxy: upstream request failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach checkout. Please try again shortly." }, { status: 502 });
  }
}
