import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import MembersWorkspace from "./MembersWorkspace";
import { BackLink } from "@/app/control/BackLink";

type Member = {
  id: string;
  user: string;
  user_details?: { id: string; display_name: string; phone?: string; email?: string };
  role: string;
  role_display: string;
  is_active: boolean;
};

export default async function ShopMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { profile, session } = result;
  const headers = authHeaders(session);

  const [shopRes, membersRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/commerce/shops/${encodeURIComponent(id)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/commerce/shop-members/?shop=${encodeURIComponent(id)}`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!shopRes.ok) notFound();
  const shop = await shopRes.json();
  if (shop.owner !== profile.userId && !profile.isSuperuser) {
    const partnersRes = await fetch(`${kisApiBase()}/api/v1/partners/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const partnersData = partnersRes.ok ? await partnersRes.json() : {};
    const allPartners: { id: string; can_manage: boolean }[] = Array.isArray(partnersData?.results) ? partnersData.results : Array.isArray(partnersData) ? partnersData : [];
    const canView = Boolean(shop.partner_id) && allPartners.some((p) => p.can_manage && p.id === shop.partner_id);
    if (!canView) notFound();
  }
  const membersData = membersRes.ok ? await membersRes.json() : {};
  const members: Member[] = Array.isArray(membersData?.results) ? membersData.results : Array.isArray(membersData) ? membersData : [];

  return (
    <>
      <BackLink href={`/control/shops/${id}`} label="Back to shop" />
      <div className="control-header">
        <h1>Team — {shop.name}</h1>
        <p>Add staff, assign roles, and manage who can help run this shop.</p>
      </div>
      <MembersWorkspace shopId={id} initialMembers={members} />
    </>
  );
}
