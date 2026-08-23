import { NextRequest, NextResponse } from "next/server";
import { authHeaders, getValidSession, kisApiBase, setSessionCookie } from "@/lib/session";

// Multipart passthrough for uploading a channel-post image/video attachment.
// controlProxy.ts's proxyToDjango can't be reused here — it always
// JSON-encodes the body — so this forwards the incoming FormData straight
// through to Django's generic authenticated attachment endpoint instead.
export async function POST(request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
  await params; // channelId isn't part of the upstream path — this endpoint is not channel-scoped server-side.
  const auth = await getValidSession();
  if (!auth) return NextResponse.json({ success: false, message: "Not signed in.", requiresLogin: true }, { status: 401 });
  const { session, refreshed } = auth;

  const incoming = await request.formData().catch(() => null);
  const file = incoming?.get("attachment");
  if (!incoming || !(file instanceof Blob)) {
    return NextResponse.json({ success: false, message: "No file provided." }, { status: 400 });
  }

  const forward = new FormData();
  forward.set("attachment", file, (file as File).name || "upload");

  try {
    const upstream = await fetch(`${kisApiBase()}/api/v1/broadcasts/profiles/attachment/`, {
      method: "POST",
      headers: authHeaders(session),
      body: forward,
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });
    const data = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(
      upstream.ok ? { success: true, data } : { success: false, message: data?.detail || "Unable to upload file.", errors: data },
      { status: upstream.status },
    );
    if (refreshed) setSessionCookie(response, session);
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Unable to reach the server." }, { status: 502 });
  }
}
