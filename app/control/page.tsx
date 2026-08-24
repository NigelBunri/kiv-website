import Link from "next/link";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";

type Shop = {
  id: string;
  name: string;
  owner: string;
  status: string;
  payout_account_status?: string;
  partner_name?: string | null;
};

type HealthInstitution = { id: string; name: string; institution_type: string; partner_name?: string | null };
type EducationInstitution = { id: string; name: string; institution_type: string; partner_name?: string | null };
type Partner = { id: string; name: string; can_manage: boolean };

async function loadShops(userId: string, headers: HeadersInit): Promise<Shop[]> {
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/commerce/shops/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return [];
    const data = await res.json();
    const rows: Shop[] = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
    // ShopViewSet's list queryset returns every active public shop plus the
    // caller's own regardless of status - narrow to "mine" the same way the
    // RN app's ProfileScreen.loadCommerceShops effectively does.
    return rows.filter((shop) => String(shop.owner) === userId);
  } catch {
    return [];
  }
}

async function loadHealthInstitutions(headers: HeadersInit): Promise<HealthInstitution[]> {
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/health-ops/institutions/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch {
    return [];
  }
}

async function loadEducationInstitutions(headers: HeadersInit): Promise<EducationInstitution[]> {
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.institutions) ? data.institutions : [];
  } catch {
    return [];
  }
}

async function loadManageablePartner(headers: HeadersInit): Promise<Partner | null> {
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/partners/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const data = await res.json();
    const rows: Partner[] = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
    return rows.find((partner) => partner.can_manage) || null;
  } catch {
    return null;
  }
}

function payoutBadge(status?: string) {
  if (status === "active") return <span className="control-badge control-badge--active">Payout connected</span>;
  if (status === "pending") return <span className="control-badge control-badge--pending">Payout pending</span>;
  return <span className="control-badge control-badge--inactive">Payout not connected</span>;
}

export default async function ControlDashboardPage() {
  const result = await fetchControlProfile();
  if (!result) return null; // layout.tsx already redirects when signed out
  const { profile, session } = result;
  const headers = authHeaders(session);

  const [shops, healthInstitutions, educationInstitutions, partner] = await Promise.all([
    loadShops(profile.userId, headers),
    loadHealthInstitutions(headers),
    loadEducationInstitutions(headers),
    profile.tierName !== "Business Pro" ? loadManageablePartner(headers) : Promise.resolve(null),
  ]);

  return (
    <>
      <div className="control-header">
        <h1>Welcome back, {profile.displayName}</h1>
        <p>Manage your KIS activities from here instead of the app.</p>
      </div>

      <div className="control-stat-grid">
        <div className="control-stat-card">
          <span>Plan</span>
          <strong>{profile.tierName}</strong>
        </div>
        <div className="control-stat-card">
          <span>Shops</span>
          <strong>{shops.length}</strong>
        </div>
        <div className="control-stat-card">
          <span>Institutions</span>
          <strong>{healthInstitutions.length + educationInstitutions.length}</strong>
        </div>
        {partner ? (
          <div className="control-stat-card">
            <span>Partner organization</span>
            <strong>{partner.name}</strong>
          </div>
        ) : null}
      </div>

      <section className="control-section">
        <h2>Your shops</h2>
        <p>Shops you own directly. Team-managed shops are not shown here yet.</p>
        {shops.length === 0 ? (
          <div className="control-empty">You don&rsquo;t have any shops yet. Create one from the KIS app to manage it here.</div>
        ) : (
          <div className="control-list">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/control/shops/${shop.id}`} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{shop.name}</div>
                  <div className="control-list-row-meta">
                    {shop.status}
                    {shop.partner_name ? ` · Managed by ${shop.partner_name}` : ""}
                  </div>
                </div>
                {payoutBadge(shop.payout_account_status)}
              </Link>
            ))}
          </div>
        )}
      </section>

      {healthInstitutions.length || educationInstitutions.length ? (
        <section className="control-section">
          <h2>Your institutions</h2>
          <p>Health and education institutions you own or manage on behalf of a partner organization.</p>
          <div className="control-list">
            {healthInstitutions.map((institution) => (
              <Link key={institution.id} href={`/control/institutions/health/${institution.id}`} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{institution.name}</div>
                  <div className="control-list-row-meta">
                    Health · {institution.institution_type}
                    {institution.partner_name ? ` · Managed by ${institution.partner_name}` : ""}
                  </div>
                </div>
              </Link>
            ))}
            {educationInstitutions.map((institution) => (
              <Link key={institution.id} href={`/control/institutions/education/${institution.id}`} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{institution.name}</div>
                  <div className="control-list-row-meta">
                    Education
                    {institution.partner_name ? ` · Managed by ${institution.partner_name}` : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {partner ? (
        <section className="control-section">
          <h2>Partner organization</h2>
          <p>You manage {partner.name}.</p>
          <div className="control-actions">
            <Link href="/control/partner" className="button primary">Open partner organization</Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
