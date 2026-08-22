import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; orderId: string }> }) {
  const { orderId } = await params;
  return proxyToDjango(request, `/api/v1/commerce/marketplace-provider-orders/${encodeURIComponent(orderId)}/complete/`, { method: "POST", forwardBody: false });
}
