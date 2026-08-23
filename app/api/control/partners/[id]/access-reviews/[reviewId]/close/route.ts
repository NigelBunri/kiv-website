import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; reviewId: string }> }) {
  const { id, reviewId } = await params;
  return proxyToDjango(
    request,
    `/api/v1/partners/${encodeURIComponent(id)}/access-reviews/${encodeURIComponent(reviewId)}/close/`,
    { method: "POST" },
  );
}
