import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import AccessGovernancePanel from "./AccessGovernancePanel";

type PartnerListRow = { id: string; name: string; can_manage: boolean };

export default async function PartnerAccessPage() {
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
          <h1>Access governance</h1>
        </div>
        <div className="control-empty">
          You don&rsquo;t manage a partner organization yet. Create or join one from the KIS app to manage access requests here.
        </div>
      </>
    );
  }

  const [requestsRes, reviewsRes, membersRes, rolesRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/access-requests/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/access-reviews/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/members/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/roles/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);

  const featureGated = requestsRes.status === 403 || reviewsRes.status === 403;

  return (
    <>
      <div className="control-header">
        <h1>{manageable.name} — Access governance</h1>
        <p>Role access requests and periodic access reviews.</p>
      </div>
      <div className="control-actions">
        <a href="/control/partner" className="button">Organization overview</a>
        <a href="/control/partner/team" className="button">Team</a>
        <a href="/control/partner/invites" className="button">Invites</a>
        <a href="/control/partner/profile" className="button">Organization profile</a>
        <a href="/control/partner/roles" className="button">Roles &amp; permissions</a>
        <a href="/control/partner/reports" className="button">Reports</a>
        <a href="/control/partner/verification" className="button">Verification</a>
        <a href="/control/partner/settings" className="button">Feature settings</a>
        <a href="/control/partner/policy" className="button">Enterprise policy</a>
      </div>

      {featureGated ? (
        <div className="control-empty">Access governance isn&rsquo;t included in your current plan&rsquo;s features.</div>
      ) : (
        <AccessGovernancePanel
          partnerId={manageable.id}
          initialRequests={requestsRes.ok ? await requestsRes.json() : []}
          initialReviews={reviewsRes.ok ? await reviewsRes.json() : []}
          members={membersRes.ok ? (await membersRes.json())?.members ?? [] : []}
          roles={rolesRes.ok ? await rolesRes.json() : []}
        />
      )}
    </>
  );
}
