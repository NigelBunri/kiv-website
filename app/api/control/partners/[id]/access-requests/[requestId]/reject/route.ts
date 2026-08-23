import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; requestId: string }> }) {
  const { id, requestId } = await params;
  return proxyToDjango(
    request,
    `/api/v1/partners/${encodeURIComponent(id)}/access-requests/${encodeURIComponent(requestId)}/reject/`,
    { method: "POST" },
  );
}
