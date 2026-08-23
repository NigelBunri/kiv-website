import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; serviceId: string }> }) {
  const { serviceId } = await params;
  return proxyToDjango(request, `/api/v1/commerce/shop-services/${encodeURIComponent(serviceId)}/`, { method: "GET" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; serviceId: string }> }) {
  const { serviceId } = await params;
  return proxyToDjango(request, `/api/v1/commerce/shop-services/${encodeURIComponent(serviceId)}/`, { method: "PATCH" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; serviceId: string }> }) {
  const { serviceId } = await params;
  return proxyToDjango(request, `/api/v1/commerce/shop-services/${encodeURIComponent(serviceId)}/`, { method: "DELETE" });
}
