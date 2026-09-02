import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// One order per shop (MarketplaceOrderViewSet.create -> place_marketplace_order),
// same USD/Stripe-or-Flutterwave checkout the app uses. Response (wrapped by
// proxyToDjango as { success, data }) carries the created order under
// `.data`, with `.data.metadata.payment_url` to redirect the buyer to -
// same "create something, read back a payment_url, redirect" shape as
// TipButton/ChannelMembershipTiers already use elsewhere in KISTube.
export async function POST(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/commerce/marketplace-orders/", { method: "POST" });
}
