import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const statusFilter = request.nextUrl.searchParams.get("status");
  const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
  return proxyToDjango(request, `/api/v1/broadcasts/channels/${encodeURIComponent(channelId)}/moderation/${query}`, { method: "GET" });
}
