import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import PolicyEditor, { type PartnerPolicySettings } from "./PolicyEditor";

type PartnerListRow = { id: string; name: string; can_manage: boolean };

const DEFAULT_POLICY: PartnerPolicySettings = {
  security: { require_mfa: false, session_timeout_minutes: 60, allow_external_sharing: true },
  compliance: { audit_enabled: true, legal_hold_enabled: false },
  retention: { message_retention_days: 365, file_retention_days: 365 },
  dlp: { enabled: false },
  data_residency: { region: "auto", allow_cross_region: true },
  automation: { webhooks_enabled: false },
  rate_limits: { messages_per_minute: 120, uploads_per_hour: 200 },
  integrations: { sso_required: false, scim_enabled: false, api_access_enabled: true },
};

export default async function PartnerPolicyPage() {
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
          <h1>Enterprise policy</h1>
        </div>
        <div className="control-empty">
          You don&rsquo;t manage a partner organization yet. Create or join one from the KIS app to manage its policy here.
        </div>
      </>
    );
  }

  const policyRes = await fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/policy/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const policyData = policyRes.ok ? await policyRes.json() : null;
  const settings: PartnerPolicySettings = {
    ...DEFAULT_POLICY,
    ...(policyData?.settings || {}),
  };

  return (
    <>
      <div className="control-header">
        <h1>{manageable.name} - Enterprise policy</h1>
        <p>Security, compliance, retention, and rate-limit controls.</p>
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
        <a href="/control/partner/access" className="button">Access governance</a>
      </div>
      <PolicyEditor partnerId={manageable.id} initialSettings={settings} />
    </>
  );
}
