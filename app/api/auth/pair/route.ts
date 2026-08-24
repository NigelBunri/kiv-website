import { NextRequest, NextResponse } from "next/server";
import { buildSession, kisApiBase, newDeviceId, setSessionCookie } from "@/lib/session";

const DEVICE_ID_COOKIE = "kis_device_id";
const DEVICE_ID_MAX_AGE = 60 * 60 * 24 * 365; // 1 year - outlives any single session, deliberately

// Redeems a short-lived pairing code generated on the user's phone (Profile
// -> Manage devices -> Web). Unlike /api/auth/verify (OTP web login, which
// only ever allows ONE web session at a time), Django's redeem endpoint
// deliberately does not revoke other web devices, so pairing from a second
// computer doesn't sign the first one out. Same device_id / cookie-sealing
// pattern as verify/route.ts - this is the only other place a raw JWT ever
// exists in this process.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const code = String(body?.code || "").trim();

  if (!code) {
    return NextResponse.json({ success: false, message: "Enter the code shown in the app." }, { status: 400 });
  }

  const existingDeviceId = request.cookies.get(DEVICE_ID_COOKIE)?.value;
  const deviceId = existingDeviceId || newDeviceId();

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/auth/devices/web-pairing/redeem/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code, device_id: deviceId, device_name: "Web browser" }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok || !data?.access || !data?.refresh) {
      return NextResponse.json(
        { success: false, message: data?.detail || "That code didn't work - check it and try again." },
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
    console.error("auth/pair proxy: upstream request failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to reach the sign-in service. Please try again shortly." },
      { status: 502 },
    );
  }
}
