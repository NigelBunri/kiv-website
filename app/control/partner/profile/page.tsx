import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import OrganizationProfileForm, { type OrganizationProfile } from "./OrganizationProfileForm";

type PartnerListRow = { id: string; name: string; can_manage: boolean };

export default async function PartnerProfilePage() {
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
          <h1>Organization profile</h1>
        </div>
        <div className="control-empty">
          You don&rsquo;t manage a partner organization yet. Create or join one from the KIS app to edit its profile here.
        </div>
      </>
    );
  }

  const profileRes = await fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/organization-profile/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const profile: OrganizationProfile = profileRes.ok ? await profileRes.json() : { display_name: manageable.name };

  return (
    <>
      <div className="control-header">
        <h1>{manageable.name} — Organization profile</h1>
        <p>Public details about your organization — mission, contact info, and branding.</p>
      </div>
      <div className="control-actions">
        <a href="/control/partner" className="button">Organization overview</a>
        <a href="/control/partner/team" className="button">Team</a>
        <a href="/control/partner/invites" className="button">Invites</a>
        <a href="/control/partner/roles" className="button">Roles &amp; permissions</a>
        <a href="/control/partner/reports" className="button">Reports</a>
        <a href="/control/partner/verification" className="button">Verification</a>
        <a href="/control/partner/settings" className="button">Settings</a>
        <a href="/control/partner/policy" className="button">Enterprise policy</a>
        <a href="/control/partner/access" className="button">Access governance</a>
      </div>
      <OrganizationProfileForm partnerId={manageable.id} initialProfile={profile} />
    </>
  );
}
