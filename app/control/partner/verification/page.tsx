import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import VerificationPanel, { type VerificationStatus } from "./VerificationPanel";

type PartnerListRow = { id: string; name: string; can_manage: boolean };

export default async function PartnerVerificationPage() {
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
          <h1>Verification</h1>
        </div>
        <div className="control-empty">
          You don&rsquo;t manage a partner organization yet. Create or join one from the KIS app to request verification here.
        </div>
      </>
    );
  }

  const statusRes = await fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/verification-status/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const initialStatus: VerificationStatus = statusRes.ok
    ? await statusRes.json()
    : { verified: false, badges: [], case: null };

  return (
    <>
      <div className="control-header">
        <h1>{manageable.name} - Verification</h1>
        <p>Request verified-partner status and track review progress.</p>
      </div>
      <div className="control-actions">
        <a href="/control/partner" className="button">Organization overview</a>
        <a href="/control/partner/team" className="button">Team</a>
        <a href="/control/partner/invites" className="button">Invites</a>
        <a href="/control/partner/profile" className="button">Organization profile</a>
        <a href="/control/partner/roles" className="button">Roles &amp; permissions</a>
        <a href="/control/partner/reports" className="button">Reports</a>
        <a href="/control/partner/settings" className="button">Settings</a>
        <a href="/control/partner/policy" className="button">Enterprise policy</a>
        <a href="/control/partner/access" className="button">Access governance</a>
      </div>
      <VerificationPanel partnerId={manageable.id} initialStatus={initialStatus} />
    </>
  );
}
