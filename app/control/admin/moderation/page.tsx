import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ModerationQueueTable from "./ModerationQueueTable";

type Summary = { total_pending: number; total_critical: number; actioned_today: number };

export default async function AdminModerationPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const [queueRes, summaryRes] = await Promise.all([
    fetch(`${kisApiBase()}/control/admin/content/queue/`, { headers, cache: "no-store", signal: AbortSignal.timeout(20_000) }),
    fetch(`${kisApiBase()}/control/admin/content/summary/`, { headers, cache: "no-store", signal: AbortSignal.timeout(20_000) }),
  ]);
  const queueData = queueRes.ok ? await queueRes.json() : { flags: [] };
  const summary: Summary | null = summaryRes.ok ? await summaryRes.json() : null;

  return (
    <>
      <div className="control-header">
        <h1>Content moderation</h1>
        <p>Platform-wide moderation queue.</p>
      </div>

      {summary ? (
        <div className="control-stat-grid">
          <div className="control-stat-card"><span>Pending</span><strong>{summary.total_pending}</strong></div>
          <div className="control-stat-card"><span>Critical</span><strong>{summary.total_critical}</strong></div>
          <div className="control-stat-card"><span>Actioned today</span><strong>{summary.actioned_today}</strong></div>
        </div>
      ) : null}

      <section className="control-section">
        <h2>Queue</h2>
        <ModerationQueueTable flags={queueData.flags || []} />
      </section>
    </>
  );
}
