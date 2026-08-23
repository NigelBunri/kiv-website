import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channels/${encodeURIComponent(channelId)}/analytics/`, { method: "GET" });
}
