import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Enroll in (and, if paid, start checkout for) a course from a Website
// Builder page. Purchasing operates on the course's underlying
// EducationInstitutionBroadcast, not the course row directly — there is
// no course-level purchase endpoint in this codebase. `checkoutContentId`
// is resolved server-side by apps.websites.kis_content_resolvers.
// resolve_courses() (the "primary purchasable broadcast" for that
// course) and passed through by the section renderer; this route calls
// the exact same enroll endpoint the mobile app's "Enroll" button hits.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const checkoutContentId = String(body?.checkoutContentId || "").trim();

  if (!checkoutContentId) {
    return NextResponse.json({ success: false, message: "This course isn't available for checkout yet." }, { status: 400 });
  }

  const auth = await getValidSession();
  if (!auth) {
    return NextResponse.json({ success: false, message: "Please sign in to enroll in this course.", requiresLogin: true }, { status: 401 });
  }
  const { session, refreshed } = auth;

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/education/contents/${encodeURIComponent(checkoutContentId)}/enroll/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) },
      body: JSON.stringify({}),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const booking = (data && typeof data.booking === "object" && data.booking) || null;

    const response = NextResponse.json(
      upstream.ok
        ? {
            success: true,
            paymentUrl: booking?.payment_url || null,
            txRef: booking?.payment_reference || null,
            // No payment_url at all means this was free/instant enrollment
            // (see EducationContentEnrollmentView) — already complete.
            enrolled: !booking?.payment_url,
          }
        : { success: false, message: data?.detail || "Unable to enroll in this course." },
      { status: upstream.ok ? 200 : upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("checkout/course proxy: upstream request failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach checkout. Please try again shortly." }, { status: 502 });
  }
}
