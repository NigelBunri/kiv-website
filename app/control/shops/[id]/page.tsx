import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ShopEditForm from "./ShopEditForm";
import PartnerConnectPanel from "../../PartnerConnectPanel";

type ShopDetail = {
  id: string;
  name: string;
  description: string;
  owner: string;
  payout_account_status?: string;
  partner_id?: string | null;
  partner_name?: string | null;
};

type Partner = { id: string; name: string; can_manage: boolean };

export default async function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null; // layout.tsx already redirects when signed out
  const { profile, session } = result;
  const headers = authHeaders(session);

  const [shopRes, partnersRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/commerce/shops/${encodeURIComponent(id)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/partners/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!shopRes.ok) notFound();
  const shop: ShopDetail = await shopRes.json();
  const partnersData = partnersRes.ok ? await partnersRes.json() : {};
  const allPartners: Partner[] = Array.isArray(partnersData?.results) ? partnersData.results : Array.isArray(partnersData) ? partnersData : [];
  const manageablePartners = allPartners.filter((partner) => partner.can_manage);

  // ShopViewSet's detail GET has no owner/staff restriction on the Django
  // side (only mutating methods do) — this page adds its own read guard so
  // a signed-in user can't browse arbitrary shop ids through the control
  // panel just by knowing the id. Owning the shop directly, or managing
  // the partner it's delegated to, both qualify.
  const canView = shop.owner === profile.userId || (Boolean(shop.partner_id) && manageablePartners.some((partner) => partner.id === shop.partner_id));
  if (!canView) notFound();

  return (
    <>
      <div className="control-header">
        <h1>{shop.name}</h1>
        <p>Shop</p>
      </div>
      <ShopEditForm shopId={shop.id} initialName={shop.name} initialDescription={shop.description || ""} />
      <section className="control-section">
        <h2>Marketplace</h2>
        <p>Manage products and incoming orders for this shop.</p>
        <div className="control-actions">
          <a href={`/control/shops/${shop.id}/products`} className="button primary">Manage products</a>
          <a href={`/control/shops/${shop.id}/orders`} className="button">View orders</a>
        </div>
      </section>
      <PartnerConnectPanel
        partnerApiPath={`/api/control/shops/${shop.id}/partner`}
        initialPartnerId={shop.partner_id || null}
        initialPartnerName={shop.partner_name || null}
        manageablePartners={manageablePartners}
      />
    </>
  );
}
