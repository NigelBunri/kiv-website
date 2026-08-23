import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params;
  return proxyToDjango(request, `/api/v1/partners/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}/moderate/`, { method: "POST" });
}
