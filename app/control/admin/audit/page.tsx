import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";

type AuditEntry = {
  id: string;
  actor?: string | null;
  action_type: string;
  target_app?: string;
  target_model?: string;
  target_pk?: string;
  severity: string;
  created_at: string;
};

export default async function AdminAuditPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/control/admin/audit/entries/?per_page=100`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(20_000),
  });
  const data = res.ok ? await res.json() : { entries: [] };
  const entries: AuditEntry[] = data.entries || [];

  return (
    <>
      <div className="control-header">
        <h1>Audit trail</h1>
        <p>Every admin action taken across the platform.</p>
      </div>
      <section className="control-section">
        {entries.length === 0 ? (
          <div className="control-empty">No audit entries yet.</div>
        ) : (
          <table className="control-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Target</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.created_at).toLocaleString()}</td>
                  <td>{entry.action_type}</td>
                  <td>{entry.target_app ? `${entry.target_app}.${entry.target_model} #${String(entry.target_pk || "").slice(0, 8)}` : "—"}</td>
                  <td><span className={`control-badge control-badge--${entry.severity === "critical" ? "inactive" : entry.severity === "warning" ? "pending" : "active"}`}>{entry.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
