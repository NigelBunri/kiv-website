import type { Metadata } from "next";
import Link from "next/link";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { KISTubeAuthGate, KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { CartShopSection } from "@/components/kistube/CartShopSection";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Cart",
  description: "Your KIS Market cart.",
  path: "/kistube/cart",
  robots: kistubeRobots(false),
});

type CartItem = { id: string; product: string; quantity: number; product_name?: string; product_image?: string; price_snapshot: string };
type CartData = { id: string; shop: string; status: string; shop_info?: { id: string; name: string; slug?: string; image_url?: string } | null; subtotal: string; items: CartItem[] };

// Server Component - calls Django directly (same convention as
// saved/page.tsx), not through app/api/kistube/** (that would be a
// self-referential HTTP hop). CartViewSet.get_queryset already scopes to
// the signed-in user; this just filters client-side to active carts with
// at least one item, since a user can have one cart per shop and most
// will be empty/checked-out.
async function fetchActiveCarts(): Promise<CartData[]> {
  const auth = await getValidSession();
  if (!auth) return [];
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/commerce/carts/`, {
      headers: { Accept: "application/json", ...authHeaders(auth.session) },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    const rows: CartData[] = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
    return rows.filter((cart) => cart.status === "active" && Array.isArray(cart.items) && cart.items.length > 0);
  } catch (error) {
    console.error("kistube cart: fetch failed", error);
    return [];
  }
}

export default async function KISTubeCartPage() {
  const { viewer } = await getKisTubeSidebarData();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">Cart</h1>
        <KISTubeAuthGate next="/kistube/cart" body="Sign in to see your KIS Market cart." />
      </div>
    );
  }

  const carts = await fetchActiveCarts();

  return (
    <div>
      <h1 className="kt-page-heading">Cart</h1>
      <p className="kt-page-subheading">Review your items and check out, shop by shop.</p>

      {carts.length === 0 ? (
        <>
          <KISTubeEmptyState title="Your cart is empty" body="Browse the Market and add products to get started." />
          <Link href="/kistube/market" className="kt-button kt-button--primary" style={{ display: "inline-block", marginTop: "1rem" }}>
            Browse Market
          </Link>
        </>
      ) : (
        carts.map((cart) => <CartShopSection key={cart.id} cart={cart} />)
      )}
    </div>
  );
}
