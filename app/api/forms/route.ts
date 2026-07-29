import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limiter";
import { validatePublicForm } from "@/lib/validation";

function clientKey(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/**
 * Verifies the Cloudflare Turnstile token against Cloudflare's own
 * siteverify endpoint. Returns true (skips verification) when
 * TURNSTILE_SECRET_KEY isn't configured — matches this codebase's existing
 * pattern of degrading honestly when a provider isn't set up (see
 * validatePublicForm's KIV_FORM_PROVIDER messaging) rather than either
 * silently accepting unverified submissions in production or breaking the
 * form entirely in an environment that hasn't configured it yet.
 */
async function verifyTurnstile(token: string, remoteIp: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: remoteIp }),
    });
    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification request failed", error);
    return false;
  }
}

/**
 * Forwards a validated submission to a Google Sheet via a Google Apps
 * Script Web App (see docs/forms-integration-setup.md for how that's set
 * up) — deliberately not the Google Sheets API directly, since that would
 * need a service-account credential managed here; the Apps Script approach
 * keeps all Google-side auth inside the user's own Google account. A
 * failure here is logged, not surfaced to the submitter: the request was
 * already validated and accepted, and a spreadsheet delivery hiccup isn't
 * something a public visitor can act on.
 */
async function forwardToSheet(payload: Record<string, string>): Promise<void> {
  const webhookUrl = process.env.KIV_FORM_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.KIV_FORM_WEBHOOK_SECRET ?? "",
        submittedAt: new Date().toISOString(),
        ...payload,
      }),
    });
    if (!response.ok) {
      console.error(`Sheet webhook responded with ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to forward form submission to sheet webhook", error);
  }
}

export async function POST(request: NextRequest) {
  const key = clientKey(request);
  if (!(await rateLimit(key))) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please wait before submitting again." }, { status: 429 });
  }

  const formData = await request.formData();
  const result = validatePublicForm(formData);
  if (!result.ok) {
    return NextResponse.json(result, { status: result.status });
  }

  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");
  const verified = await verifyTurnstile(turnstileToken, key);
  if (!verified) {
    return NextResponse.json(
      { ok: false, message: "Verification failed. Please retry the challenge below and submit again." },
      { status: 400 },
    );
  }

  // Provider integration belongs server-side only. SES/SMTP credentials must never be exposed to the client.
  if (result.payload) {
    await forwardToSheet(result.payload);
  }

  return NextResponse.json({ ok: true, message: result.message }, { status: 200 });
}
