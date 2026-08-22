import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Locks context server-side to "education_material" — never trust the
// browser to name its own upload context, since that's what determines
// the allowed file types/size ceiling Django enforces on confirm.
export async function POST(request: NextRequest) {
  const auth = await getValidSession();
  if (!auth) return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  const { session, refreshed } = auth;

  const body = await request.json().catch(() => ({}));
  const filename = String(body?.filename || "");
  const contentType = String(body?.content_type || "");
  const sizeBytes = Number(body?.size_bytes || 0);
  const targetId = String(body?.target_id || "");

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/media/uploads/initiate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) },
      body: JSON.stringify({ context: "education_material", filename, content_type: contentType, size_bytes: sizeBytes, target_id: targetId }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(
      upstream.ok ? { success: true, data } : { success: false, message: data?.detail || "Unable to start the upload.", errors: data },
      { status: upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("education upload initiate proxy failed", error);
    return NextResponse.json({ success: false, message: "Unable to reach the server. Please try again shortly." }, { status: 502 });
  }
}
