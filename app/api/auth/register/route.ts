import { NextRequest, NextResponse } from "next/server";
import { buildSession, kisApiBase, newDeviceId, setSessionCookie } from "@/lib/session";

const DEVICE_ID_COOKIE = "kis_device_id";
const DEVICE_ID_MAX_AGE = 60 * 60 * 24 * 365;

// Creates a brand-new KIS account - same Django endpoint and same User
// table the mobile app's RegisterScreen posts to (apps.accounts.views.
// RegisterView / UserCreateSerializer), so an account created here can log
// into the app immediately afterward with no backend changes (its first
// device isn't QR-blocked since none exists yet - see
// password_login_requires_qr). With phone verification disabled (the
// current default - settings.KIS_PHONE_VERIFICATION_ENABLED=False),
// Django returns access/refresh tokens directly on this one call, no OTP
// round-trip needed.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const dialCode = String(body?.dialCode || "").trim();
  const nationalNumber = String(body?.phoneNumber || "").replace(/\D/g, "");
  const country = String(body?.country || "").trim().toUpperCase();
  const password = String(body?.password || "");
  const password2 = String(body?.password2 || "");
  const displayName = String(body?.displayName || "").trim();

  if (!dialCode || !nationalNumber || !country) {
    return NextResponse.json({ success: false, message: "Country and phone number are required." }, { status: 400 });
  }
  if (!password || password !== password2) {
    return NextResponse.json({ success: false, message: "Passwords must match." }, { status: 400 });
  }

  const existingDeviceId = request.cookies.get(DEVICE_ID_COOKIE)?.value;
  const deviceId = existingDeviceId || newDeviceId();

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        phone: `${dialCode}${nationalNumber}`,
        phone_country_code: dialCode,
        phone_number: nationalNumber,
        country,
        password,
        password2,
        device_id: deviceId,
        device_platform: "web",
        ...(displayName ? { display_name: displayName } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const message =
        data?.detail ||
        data?.password?.[0] ||
        data?.phone?.[0] ||
        data?.phone_number?.[0] ||
        Object.values(data || {}).flat().find((v) => typeof v === "string") ||
        "Unable to create your account.";
      return NextResponse.json({ success: false, message }, { status: upstream.status });
    }

    if (!data?.access || !data?.refresh) {
      // Phone verification is on for this deployment - no tokens yet,
      // the account needs an OTP step before it's usable. Not the
      // current default, but handle it rather than assume it can't happen.
      return NextResponse.json({ success: true, pendingVerification: true, user: data.user });
    }

    const response = NextResponse.json({ success: true, user: data.user });
    setSessionCookie(
      response,
      buildSession({ access: data.access, refresh: data.refresh, deviceId, userId: String(data.user?.id ?? "") }),
    );
    if (!existingDeviceId) {
      response.cookies.set(DEVICE_ID_COOKIE, deviceId, {
        httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: DEVICE_ID_MAX_AGE,
      });
    }
    return response;
  } catch (error) {
    console.error("auth/register proxy: upstream request failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to reach the sign-up service. Please try again shortly." },
      { status: 502 },
    );
  }
}
