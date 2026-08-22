import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// MarketplaceProviderOrderViewSet returns every order across every shop
// the signed-in user provider-manages (no shop-scoped filter server-side)
// — the [id] page filters client-side to this shop, same pattern as the
// dashboard's shop list.
export async function GET(request: NextRequest) {
  return proxyToDjango(request, `/api/v1/commerce/marketplace-provider-orders/`, { method: "GET" });
}
