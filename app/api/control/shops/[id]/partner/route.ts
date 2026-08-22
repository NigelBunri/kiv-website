import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Proxies ShopPartnerConnectView (apps/commerce/views.py) — same endpoint
// the RN app's ShopEditorDrawer "Connect partner"/"Disconnect partner"
// actions already call.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/commerce/shops/${encodeURIComponent(id)}/partner/`, { method: "POST" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/commerce/shops/${encodeURIComponent(id)}/partner/`, { method: "DELETE" });
}
