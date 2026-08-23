import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Shared Route Handler body for every app/api/control/** proxy — extracted
// because a dozen+ of these would otherwise repeat the exact same
// auth-check / forward / refresh-cookie shape already established by
// app/api/cart/items/route.ts. One Django call per invocation; no new
// backend logic, these are thin pass-throughs to endpoints that already
// exist (this session's Shop/HealthInstitution/EducationInstitution
// partner endpoints, apps.partners' PartnerViewSet, admin_control's
// views) and already enforce their own permissions server-side — this
// proxy adds nothing beyond "attach the signed-in user's auth headers".
export async function proxyToDjango(
  request: NextRequest,
  djangoPath: string,
  options: { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; forwardBody?: boolean } = {},
): Promise<NextResponse> {
  const auth = await getValidSession();
  if (!auth) {
    return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  }
  const { session, refreshed } = auth;
  const method = options.method || (request.method as "GET" | "POST" | "PATCH" | "PUT" | "DELETE");
  const shouldForwardBody = options.forwardBody ?? (method !== "GET" && method !== "DELETE");
  let body: string | undefined;
  if (shouldForwardBody) {
    body = JSON.stringify(await request.json().catch(() => ({})));
  }

  try {
    const upstream = await fetch(`${kisApiBase()}${djangoPath}`, {
      method,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(
      upstream.ok
        ? { success: true, data }
        : { success: false, message: data?.detail || firstError(data) || "Something went wrong.", errors: data },
      { status: upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error(`control proxy ${djangoPath} failed`, error);
    return NextResponse.json({ success: false, message: "Unable to reach the server. Please try again shortly." }, { status: 502 });
  }
}

function firstError(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const values = Object.values(data as Record<string, unknown>);
  const first = values[0];
  return Array.isArray(first) ? String(first[0] || "") : typeof first === "string" ? first : "";
}
