import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import OrdersList from "./OrdersList";
import { BackLink } from "@/app/control/BackLink";

type Order = {
  id: string;
  shop: string;
  status: string;
  total_usd_label?: string;
  buyer_info?: { name?: string; display_name?: string } | null;
  items?: { product_name?: string; quantity?: number }[];
  created_at?: string;
};

export default async function OrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const [shopRes, ordersRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/commerce/shops/${encodeURIComponent(id)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/commerce/marketplace-provider-orders/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!shopRes.ok) notFound();
  const shop = await shopRes.json();
  const ordersData = ordersRes.ok ? await ordersRes.json() : {};
  const allOrders: Order[] = Array.isArray(ordersData?.results) ? ordersData.results : Array.isArray(ordersData) ? ordersData : [];
  const orders = allOrders.filter((order) => order.shop === id);

  return (
    <>
      <BackLink href={`/control/shops/${id}`} label="Back to shop" />
      <div className="control-header">
        <h1>Orders — {shop.name}</h1>
        <p>Incoming marketplace orders for this shop.</p>
      </div>
      <OrdersList shopId={id} initialOrders={orders} />
    </>
  );
}
