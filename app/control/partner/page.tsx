import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";

type PartnerListRow = { id: string; name: string; avatar_url?: string; can_manage: boolean };
type PartnerDetail = { id: string; name: string; description?: string; avatar_url?: string };
type OrganizationLink = { id: string; owner_type: string; owner_id: string; name: string; exists: boolean };

const OWNER_TYPE_LABELS: Record<string, string> = {
  shop: "Shop",
  health_institution: "Health institution",
  education_institution: "Education institution",
  broadcast_channel: "Broadcast channel",
};

export default async function PartnerOrganizationPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const listRes = await fetch(`${kisApiBase()}/api/v1/partners/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  const listData = listRes.ok ? await listRes.json() : {};
  const rows: PartnerListRow[] = Array.isArray(listData?.results) ? listData.results : Array.isArray(listData) ? listData : [];
  const manageable = rows.find((row) => row.can_manage);

  if (!manageable) {
    return (
      <>
        <div className="control-header">
          <h1>Partner organization</h1>
        </div>
        <div className="control-empty">
          You don&rsquo;t manage a partner organization yet. Create or join one from the KIS app to manage it here.
        </div>
      </>
    );
  }

  const [detailRes, organizationsRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/organizations/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  const detail: PartnerDetail = detailRes.ok ? await detailRes.json() : manageable;
  const organizationsData = organizationsRes.ok ? await organizationsRes.json() : {};
  const organizations: OrganizationLink[] = Array.isArray(organizationsData?.organizations) ? organizationsData.organizations : [];

  return (
    <>
      <div className="control-header">
        <h1>{detail.name}</h1>
        <p>Partner organization</p>
      </div>

      <div className="control-actions">
        <a href="/control/partner/team" className="button primary">Team</a>
        <a href="/control/partner/invites" className="button">Invites</a>
      </div>

      {detail.description ? (
        <section className="control-section">
          <h2>About</h2>
          <p>{detail.description}</p>
        </section>
      ) : null}

      <section className="control-section">
        <h2>Linked organizations</h2>
        <p>
          Shops, institutions, and channels this partner&rsquo;s owner has personally linked to
          this profile. This is separate from delegated management — see each shop or
          institution&rsquo;s own page for that.
        </p>
        {organizations.length === 0 ? (
          <div className="control-empty">No organizations linked yet.</div>
        ) : (
          <table className="control-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((link) => (
                <tr key={link.id}>
                  <td>{link.exists ? link.name : <em>No longer exists</em>}</td>
                  <td>{OWNER_TYPE_LABELS[link.owner_type] || link.owner_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
