import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";

type PartnerListRow = { id: string; name: string; can_manage: boolean };
type Summary = {
  members_total: number;
  roles: number;
  role_assignments: number;
  automation_rules: number;
  audit_events: number;
  job_posts: number;
  applications: number;
  posts: number;
  post_comments: number;
  post_reactions: number;
  integrations: number;
  webhooks: number;
  engagement_rate: number;
};

export default async function PartnerReportsPage() {
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
          <h1>Reports</h1>
        </div>
        <div className="control-empty">
          You don&rsquo;t manage a partner organization yet. Create or join one from the KIS app to view its reports here.
        </div>
      </>
    );
  }

  const summaryRes = await fetch(`${kisApiBase()}/api/v1/partners/${manageable.id}/reports/summary/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const summary: Summary | null = summaryRes.ok ? await summaryRes.json() : null;

  return (
    <>
      <div className="control-header">
        <h1>{manageable.name} - Reports</h1>
        <p>Activity summary for your partner organization.</p>
      </div>
      <div className="control-actions">
        <a href="/control/partner" className="button">Organization overview</a>
        <a href="/control/partner/team" className="button">Team</a>
        <a href="/control/partner/invites" className="button">Invites</a>
        <a href="/control/partner/profile" className="button">Organization profile</a>
        <a href="/control/partner/roles" className="button">Roles &amp; permissions</a>
        <a href="/control/partner/verification" className="button">Verification</a>
        <a href="/control/partner/settings" className="button">Settings</a>
        <a href="/control/partner/policy" className="button">Enterprise policy</a>
        <a href="/control/partner/access" className="button">Access governance</a>
      </div>

      {!summary ? (
        <div className="control-empty">
          {summaryRes.status === 403
            ? "Reports aren't included in your current plan's features."
            : "Unable to load reports right now."}
        </div>
      ) : (
        <section className="control-section">
          <h2>Overview</h2>
          <div className="control-stat-grid">
            <div className="control-stat-card"><span>Members</span><strong>{summary.members_total}</strong></div>
            <div className="control-stat-card"><span>Posts</span><strong>{summary.posts}</strong></div>
            <div className="control-stat-card"><span>Comments</span><strong>{summary.post_comments}</strong></div>
            <div className="control-stat-card"><span>Reactions</span><strong>{summary.post_reactions}</strong></div>
            <div className="control-stat-card"><span>Engagement rate (7d)</span><strong>{summary.engagement_rate}</strong></div>
            <div className="control-stat-card"><span>Job posts</span><strong>{summary.job_posts}</strong></div>
            <div className="control-stat-card"><span>Applications</span><strong>{summary.applications}</strong></div>
            <div className="control-stat-card"><span>Named roles</span><strong>{summary.roles}</strong></div>
            <div className="control-stat-card"><span>Role assignments</span><strong>{summary.role_assignments}</strong></div>
            <div className="control-stat-card"><span>Automation rules</span><strong>{summary.automation_rules}</strong></div>
            <div className="control-stat-card"><span>Integrations</span><strong>{summary.integrations}</strong></div>
            <div className="control-stat-card"><span>Webhooks</span><strong>{summary.webhooks}</strong></div>
          </div>
        </section>
      )}
    </>
  );
}
