import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import UserActions from "./UserActions";

type AdminUser = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  phone: string;
  tier: string;
  status: string;
  is_active: boolean;
  is_deleted: boolean;
  country: string;
  is_staff: boolean;
  is_superuser: boolean;
  trust_score: number;
  date_joined: string | null;
};

type BlockedIncident = { id: string; context: string; mime_type: string; created_at: string | null; reason: string; deleted_at: string | null };
type WarningAction = { id: string; action: string; notes: string; created_at: string | null; auto_generated: boolean };
type PendingDeletion = { id: string; scheduled_for: string; created_at: string } | null;

type Violations = {
  violation_count: number;
  actions_taken: number;
  blocked_incidents: BlockedIncident[];
  warning_history: WarningAction[];
  pending_deletion: PendingDeletion;
};

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const [res, violationsRes] = await Promise.all([
    fetch(`${kisApiBase()}/control/admin/users/${encodeURIComponent(id)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/control/admin/users/${encodeURIComponent(id)}/violations/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!res.ok) notFound();
  const data = await res.json();
  const user: AdminUser = data.user;
  const violations: Violations | null = violationsRes.ok ? await violationsRes.json() : null;

  return (
    <>
      <div className="control-header">
        <h1>{user.display_name || user.username}</h1>
        <p>{user.email}</p>
      </div>

      <section className="control-section">
        <h2>Account</h2>
        <div className="control-list">
          <div className="control-list-row"><div className="control-list-row-title">Tier</div><span className="control-badge control-badge--pending">{user.tier}</span></div>
          <div className="control-list-row"><div className="control-list-row-title">Status</div><span className={`control-badge ${user.status === "active" ? "control-badge--active" : "control-badge--inactive"}`}>{user.status}</span></div>
          <div className="control-list-row"><div className="control-list-row-title">Phone</div><span>{user.phone || "-"}</span></div>
          <div className="control-list-row"><div className="control-list-row-title">Country</div><span>{user.country || "-"}</span></div>
          <div className="control-list-row"><div className="control-list-row-title">Trust score</div><span>{user.trust_score}</span></div>
          <div className="control-list-row"><div className="control-list-row-title">Joined</div><span>{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "-"}</span></div>
        </div>
      </section>

      {violations ? (
        <section className="control-section">
          <h2>Violations</h2>
          <div className="control-stat-grid">
            <div className="control-stat-card"><span>Confirmed violations</span><strong>{violations.violation_count}</strong></div>
            <div className="control-stat-card"><span>Blocked incidents</span><strong>{violations.blocked_incidents.length}</strong></div>
          </div>

          {violations.pending_deletion ? (
            <p className="control-error">
              Account scheduled for permanent deletion at{" "}
              {new Date(violations.pending_deletion.scheduled_for).toLocaleString()}. Use Restore above to cancel.
            </p>
          ) : null}

          {violations.blocked_incidents.length > 0 ? (
            <>
              <h3 style={{ fontSize: "0.95rem", marginTop: "1rem" }}>Blocked-content incidents</h3>
              <div className="control-list">
                {violations.blocked_incidents.map((incident) => (
                  <div key={incident.id} className="control-list-row">
                    <div>
                      <div className="control-list-row-title">{incident.context} · {incident.mime_type}</div>
                      <div className="control-list-row-meta">
                        {incident.reason} · {incident.created_at ? new Date(incident.created_at).toLocaleString() : "-"}
                        {incident.deleted_at ? ` · permanently deleted ${new Date(incident.deleted_at).toLocaleDateString()}` : " · pending deletion"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {violations.warning_history.length > 0 ? (
            <>
              <h3 style={{ fontSize: "0.95rem", marginTop: "1rem" }}>Warning / suspension history</h3>
              <div className="control-list">
                {violations.warning_history.map((row) => (
                  <div key={row.id} className="control-list-row">
                    <div>
                      <div className="control-list-row-title">{row.action}{row.auto_generated ? " (automatic)" : ""}</div>
                      <div className="control-list-row-meta">
                        {row.notes} · {row.created_at ? new Date(row.created_at).toLocaleString() : "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      <UserActions
        userId={user.id}
        status={user.status}
        tier={user.tier}
        isActive={user.is_active}
        isDeleted={user.is_deleted}
        hasPendingDeletion={Boolean(violations?.pending_deletion)}
      />
    </>
  );
}
