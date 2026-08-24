import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import TeamRoster, { type MemberEntry } from "./TeamRoster";

type PartnerListRow = { id: string; name: string; can_manage: boolean };

export default async function PartnerTeamPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { profile, session } = result;
  const headers = authHeaders(session);

  const listRes = await fetch(`${kisApiBase()}/api/v1/partners/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  const listData = listRes.ok ? await listRes.json() : {};
  const rows: PartnerListRow[] = Array.isArray(listData?.results) ? listData.results : Array.isArray(listData) ? listData : [];
  const manageable = rows.find((row) => row.can_manage);

  if (!manageable) {
    return (
      <>
        <div className="control-header">
          <h1>Team</h1>
        </div>
        <div className="control-empty">
          You don&rsquo;t manage a partner organization yet. Create or join one from the KIS app to manage its team here.
        </div>
      </>
    );
  }

  const [membersRes, detailRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/members/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  const membersData = membersRes.ok ? await membersRes.json() : {};
  const members: MemberEntry[] = Array.isArray(membersData?.members) ? membersData.members : [];
  const detail = detailRes.ok ? await detailRes.json() : {};
  const ownerId: string = String(detail?.owner || "");

  return (
    <>
      <div className="control-header">
        <h1>{manageable.name} - Team</h1>
        <p>Manage roles and moderate members of your partner organization.</p>
      </div>
      <div className="control-actions">
        <a href="/control/partner" className="button">Organization overview</a>
        <a href="/control/partner/invites" className="button">Invites</a>
        <a href="/control/partner/profile" className="button">Organization profile</a>
        <a href="/control/partner/roles" className="button">Roles &amp; permissions</a>
        <a href="/control/partner/reports" className="button">Reports</a>
        <a href="/control/partner/verification" className="button">Verification</a>
        <a href="/control/partner/settings" className="button">Settings</a>
        <a href="/control/partner/policy" className="button">Enterprise policy</a>
        <a href="/control/partner/access" className="button">Access governance</a>
      </div>
      <TeamRoster partnerId={manageable.id} initialMembers={members} viewerUserId={profile.userId} ownerId={ownerId} />
    </>
  );
}
