import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/publish/`, { method: "POST", forwardBody: false });
}
