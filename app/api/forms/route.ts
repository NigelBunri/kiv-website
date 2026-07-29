import { NextRequest, NextResponse } from "next/server";
import { validatePublicForm } from "@/lib/validation";

const submissions = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 5;

function clientKey(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function rateLimit(key: string) {
  const now = Date.now();
  const existing = submissions.get(key);
  if (!existing || existing.resetAt < now) {
    submissions.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= LIMIT) return false;
  existing.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const key = clientKey(request);
  if (!rateLimit(key)) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please wait before submitting again." }, { status: 429 });
  }

  const formData = await request.formData();
  const result = validatePublicForm(formData);
  if (!result.ok) {
    return NextResponse.json(result, { status: result.status });
  }

  // Provider integration belongs server-side only. SES/SMTP/webhook credentials must never be exposed to the client.
  return NextResponse.json({ ok: true, message: result.message }, { status: 200 });
}
