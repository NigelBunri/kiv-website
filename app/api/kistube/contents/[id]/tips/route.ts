import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// GET (list completed tips, "who tipped" display) is technically
// IsAuthenticated upstream, matching every other engagement action in
// this app (react/save/comment) - not flipped to AllowAny since it wasn't
// flagged in the anonymous-viewer audit, only the read-only PLAYER
// features were. POST creates a Super-Thanks-style payment intent.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(id)}/tips/`, { method: "GET" });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(id)}/tips/`, { method: "POST" });
}
