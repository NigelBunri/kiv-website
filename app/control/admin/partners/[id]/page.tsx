import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import PartnerActivationToggle from "./PartnerActivationToggle";

type AdminPartner = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string | null;
  owner: { id: string; email: string | null; username: string | null; tier: string | null } | null;
};

type AuditEvent = { id: number | string; action: string; actor_id: string | null; created_at: string };

export default async function AdminPartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/control/admin/partners/${encodeURIComponent(id)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!res.ok) notFound();
  const data = await res.json();
  const partner: AdminPartner = data.partner;
  const events: AuditEvent[] = data.recent_audit_events || [];

  return (
    <>
      <div className="control-header">
        <h1>{partner.name}</h1>
        <p>@{partner.slug} · {data.member_count} members</p>
      </div>

      <section className="control-section">
        <h2>Owner</h2>
        <p>{partner.owner?.email || partner.owner?.username || "—"} ({partner.owner?.tier || "—"})</p>
      </section>

      <PartnerActivationToggle partnerId={partner.id} isActive={partner.is_active} />

      <section className="control-section">
        <h2>Recent activity</h2>
        {events.length === 0 ? (
          <div className="control-empty">No recent audit events.</div>
        ) : (
          <table className="control-table">
            <thead>
              <tr><th>Action</th><th>When</th></tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.action}</td>
                  <td>{new Date(event.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
