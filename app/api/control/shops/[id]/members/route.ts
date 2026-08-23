import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getValidSession();
  if (!auth) return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  const { session, refreshed } = auth;
  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/commerce/shop-members/?shop=${encodeURIComponent(id)}`, {
      headers: authHeaders(session), cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(upstream.ok ? { success: true, data } : { success: false, message: "Unable to load members." }, { status: upstream.status });
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Unable to reach the server." }, { status: 502 });
  }
}

// shop is injected server-side from the route param, same reasoning as
// the products/services proxies.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getValidSession();
  if (!auth) return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  const { session, refreshed } = auth;
  const body = await request.json().catch(() => ({}));
  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/commerce/shop-members/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) },
      body: JSON.stringify({ ...body, shop: id }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(
      upstream.ok ? { success: true, data } : { success: false, message: data?.detail || firstError(data) || "Unable to add member.", errors: data },
      { status: upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Unable to reach the server." }, { status: 502 });
  }
}

function firstError(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const values = Object.values(data as Record<string, unknown>);
  const first = values[0];
  return Array.isArray(first) ? String(first[0] || "") : typeof first === "string" ? first : "";
}
