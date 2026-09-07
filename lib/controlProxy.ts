import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Shared Route Handler body for every app/api/control/** proxy - extracted
// because a dozen+ of these would otherwise repeat the exact same
// auth-check / forward / refresh-cookie shape already established by
// app/api/cart/items/route.ts. One Django call per invocation; no new
// backend logic, these are thin pass-throughs to endpoints that already
// exist (this session's Shop/HealthInstitution/EducationInstitution
// partner endpoints, apps.partners' PartnerViewSet, admin_control's
// views) and already enforce their own permissions server-side - this
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
  // DELETE used to be excluded here like GET (no body needed for either by
  // REST convention), but empirically every DELETE through this proxy came
  // back a 502 "Unable to reach the server" - 100% reproducible, while
  // PATCH/POST/PUT on the exact same Django host never did. The Django-side
  // operation was actually succeeding every time (confirmed: retrying the
  // same DELETE came back 404, i.e. already gone) - only the response back
  // through this Worker->origin hop was failing, and forwarding a body
  // (even an empty one) is the one thing that reliably made it stop.
  // Consistent with a bodyless-DELETE quirk somewhere in the Worker fetch /
  // origin proxy chain, not a Django bug - Django's DELETE handlers never
  // read request.data, so sending "{}" instead of no body is inert there.
  const shouldForwardBody = options.forwardBody ?? method !== "GET";
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
