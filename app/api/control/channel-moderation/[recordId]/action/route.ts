import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ recordId: string }> }) {
  const { recordId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-moderation/${encodeURIComponent(recordId)}/action/`, { method: "POST" });
}
