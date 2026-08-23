import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import RolesManager, { type PartnerRole, type PartnerRoleAssignment } from "./RolesManager";
import type { MemberEntry } from "../team/TeamRoster";

type PartnerListRow = { id: string; name: string; can_manage: boolean };

export default async function PartnerRolesPage() {
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
          <h1>Roles &amp; permissions</h1>
        </div>
        <div className="control-empty">
          You don&rsquo;t manage a partner organization yet. Create or join one from the KIS app to manage roles here.
        </div>
      </>
    );
  }

  const [rolesRes, assignmentsRes, membersRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/roles/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/role-assignments/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/members/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  const roles: PartnerRole[] = rolesRes.ok ? await rolesRes.json() : [];
  const assignments: PartnerRoleAssignment[] = assignmentsRes.ok ? await assignmentsRes.json() : [];
  const membersData = membersRes.ok ? await membersRes.json() : {};
  const members: MemberEntry[] = Array.isArray(membersData?.members) ? membersData.members : [];

  return (
    <>
      <div className="control-header">
        <h1>{manageable.name} — Roles &amp; permissions</h1>
        <p>Fine-grained named roles, on top of the basic member/manager/admin team roles.</p>
      </div>
      <div className="control-actions">
        <a href="/control/partner" className="button">Organization overview</a>
        <a href="/control/partner/team" className="button">Team</a>
        <a href="/control/partner/invites" className="button">Invites</a>
        <a href="/control/partner/profile" className="button">Organization profile</a>
        <a href="/control/partner/reports" className="button">Reports</a>
        <a href="/control/partner/verification" className="button">Verification</a>
        <a href="/control/partner/settings" className="button">Settings</a>
        <a href="/control/partner/policy" className="button">Enterprise policy</a>
      </div>
      <RolesManager
        partnerId={manageable.id}
        initialRoles={Array.isArray(roles) ? roles : []}
        initialAssignments={Array.isArray(assignments) ? assignments : []}
        members={members}
      />
    </>
  );
}
