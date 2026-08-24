import { NextRequest, NextResponse } from "next/server";
import { kisApiBase } from "@/lib/session";

// Step 1 of website login: request an OTP code for an existing KIS
// account. Server-side proxy to Django's OTP initiate endpoint - same
// reasoning as app/api/payment-status/route.ts (avoids any CORS
// dependency; server-to-server isn't subject to it).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body?.phone || "").trim();
  const country = String(body?.country || "CM").trim().toUpperCase();
  const channel = String(body?.channel || "sms").trim();

  if (!phone) {
    return NextResponse.json({ success: false, message: "Phone number is required." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/auth/otp/initiate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ phone, country, channel, purpose: "web_login" }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("auth/login proxy: upstream request failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to reach the sign-in service. Please try again shortly." },
      { status: 502 },
    );
  }
}
