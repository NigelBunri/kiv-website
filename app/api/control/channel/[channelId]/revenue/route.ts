import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const days = request.nextUrl.searchParams.get("days");
  const query = days ? `?days=${encodeURIComponent(days)}` : "";
  return proxyToDjango(request, `/api/v1/broadcasts/channels/${encodeURIComponent(channelId)}/revenue/${query}`, { method: "GET" });
}
