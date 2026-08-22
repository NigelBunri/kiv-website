import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";

type Widget = { value: number | string; label: string; aux?: Record<string, number> };
type DashboardPayload = {
  status: string;
  generated_at: string;
  widgets: Record<string, Widget>;
  top_institutions?: Array<{ name?: string; [key: string]: unknown }>;
  suspicious_activity?: Array<Record<string, unknown>>;
};

export default async function AdminOverviewPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/control/admin/dashboard/overview/`, { headers, cache: "no-store", signal: AbortSignal.timeout(20_000) });
  const payload: DashboardPayload | null = res.ok ? await res.json() : null;

  return (
    <>
      <div className="control-header">
        <h1>Platform overview</h1>
        <p>{payload ? `Updated ${new Date(payload.generated_at).toLocaleString()}` : "Unable to load dashboard data."}</p>
      </div>

      {payload ? (
        <div className="control-stat-grid">
          {Object.entries(payload.widgets || {}).map(([key, widget]) => (
            <div key={key} className="control-stat-card">
              <span>{widget.label}</span>
              <strong>{widget.value}</strong>
            </div>
          ))}
        </div>
      ) : null}

      {payload?.suspicious_activity?.length ? (
        <section className="control-section">
          <h2>Suspicious activity</h2>
          <p>Flagged for review by the platform&rsquo;s anomaly checks.</p>
          <pre className="control-note" style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(payload.suspicious_activity, null, 2)}
          </pre>
        </section>
      ) : null}
    </>
  );
}
