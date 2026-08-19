import { NextRequest, NextResponse } from "next/server";
import { buildSession, kisApiBase, newDeviceId, setSessionCookie } from "@/lib/session";

const DEVICE_ID_COOKIE = "kis_device_id";
const DEVICE_ID_MAX_AGE = 60 * 60 * 24 * 365; // 1 year — outlives any single session, deliberately

// Step 2 of website login: verify the OTP code. On success, Django returns
// access/refresh tokens for the existing account (purpose=web_login — see
// apps/otp/views.py, rejects unknown phones with 404 rather than
// registering a new account). This handler is the ONLY place a raw JWT
// ever exists in this process — it's immediately sealed into an httpOnly
// session cookie and never returned to the browser.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body?.phone || "").trim();
  const country = String(body?.country || "CM").trim().toUpperCase();
  const code = String(body?.code || "").trim();

  if (!phone || !code) {
    return NextResponse.json({ success: false, message: "Phone number and code are required." }, { status: 400 });
  }

  // device_id must stay stable across this browser's logins — Django's
  // Device model (the same one every mobile session already relies on for
  // DeviceBoundJWTAuthentication/refresh/revoke) is keyed on it, so a new
  // id on every login would silently pile up a new "device" row each time
  // instead of reusing one. Persisted separately from the session cookie
  // (long-lived, survives logout) so a repeat sign-in on the same browser
  // is recognized as the same device.
  const existingDeviceId = request.cookies.get(DEVICE_ID_COOKIE)?.value;
  const deviceId = existingDeviceId || newDeviceId();

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/auth/otp/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ phone, country, code, purpose: "web_login", device_id: deviceId, device_platform: "web" }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok || !data?.access || !data?.refresh) {
      return NextResponse.json(
        { success: false, message: data?.message || "That code didn't work — check it and try again." },
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
    console.error("auth/verify proxy: upstream request failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to reach the sign-in service. Please try again shortly." },
      { status: 502 },
    );
  }
}
