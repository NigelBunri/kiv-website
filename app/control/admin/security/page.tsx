import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import SecurityFlagsList from "./SecurityFlagsList";

type Flag = {
  id: string;
  actor?: string | null;
  reason: string;
  path?: string;
  severity: string;
  resolved: boolean;
  created_at: string;
};

type WarningNotification = {
  id: string;
  user_id: string;
  user_display_name: string | null;
  type: string;
  title: string;
  body: string;
  created_at: string;
};

export default async function AdminSecurityPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/control/admin/activity/flags/?resolved=false`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(20_000),
  });
  const data = res.ok ? await res.json() : null;
  // Tolerates the old bare-array response shape too, in case this ever
  // renders against a not-yet-redeployed backend.
  const flags: Flag[] = Array.isArray(data) ? data : Array.isArray(data?.flags) ? data.flags : [];
  const warningNotifications: WarningNotification[] = Array.isArray(data?.warning_notifications) ? data.warning_notifications : [];

  return (
    <>
      <div className="control-header">
        <h1>Suspicious activity</h1>
        <p>Unresolved flags from platform monitoring.</p>
      </div>
      <SecurityFlagsList initialFlags={flags} />

      <section className="control-section">
        <h2>Moderation warnings sent</h2>
        <p>The actual warning/suspension notifications delivered to users, most recent first.</p>
        {warningNotifications.length === 0 ? (
          <div className="control-empty">No moderation warnings sent yet.</div>
        ) : (
          <div className="control-list">
            {warningNotifications.map((n) => (
              <div key={n.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{n.title}</div>
                  <p className="control-note" style={{ margin: "0.25rem 0" }}>{n.body}</p>
                  <div className="control-list-row-meta">
                    To: {n.user_display_name || n.user_id} · {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                <a href={`/control/admin/users/${n.user_id}`} className="button secondary">
                  View user
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
