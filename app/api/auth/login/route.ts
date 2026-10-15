import { NextRequest, NextResponse } from "next/server";
import { buildSession, kisApiBase, newDeviceId, setSessionCookie } from "@/lib/session";

const DEVICE_ID_COOKIE = "kis_device_id";
const DEVICE_ID_MAX_AGE = 60 * 60 * 24 * 365; // 1 year - outlives any single session, deliberately

// Website login, in one step: phone + password against Django's real
// current login endpoint (apps/accounts/views.py's LoginView). This used
// to be a two-step SMS verification-code flow (request a code, then
// verify it) against a pair of OTP endpoints under /api/v1/auth/ that no
// longer exist (the backend's otp app has no views/urls at all - that
// mechanism was removed as part of the KIS Google Auth migration), so
// this always failed. The mobile app already logs in exactly this way
// (src/screens/LoginScreen.tsx) - mirrored here rather than inventing a
// separate web-only auth design.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body?.phone || "").trim();
  const password = String(body?.password || "");
  const country = String(body?.country || "CM").trim().toUpperCase();

  if (!phone || !password) {
    return NextResponse.json({ success: false, message: "Phone number and password are required." }, { status: 400 });
  }

  const existingDeviceId = request.cookies.get(DEVICE_ID_COOKIE)?.value;
  const deviceId = existingDeviceId || newDeviceId();

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        phone,
        country,
        password,
        device_id: deviceId,
        device_platform: "web",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok || !data?.access || !data?.refresh) {
      // Surfaced as-is (error_code, secondary_device_required,
      // qr_login_required, two_factor_required) so the form can show the
      // right next step - same fields the mobile login screen already
      // branches on, see LoginForm.tsx.
      return NextResponse.json(
        {
          success: false,
          message: data?.detail || data?.message || "Invalid phone number or password.",
          error_code: data?.error_code,
          secondary_device_required: data?.secondary_device_required ?? data?.qr_login_required,
          two_factor_required: data?.two_factor_required,
        },
        { status: upstream.status || 400 },
      );
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
    console.error("auth/login proxy: upstream request failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to reach the sign-in service. Please try again shortly." },
      { status: 502 },
    );
  }
}
