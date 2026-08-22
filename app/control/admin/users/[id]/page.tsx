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
  country: string;
  is_staff: boolean;
  is_superuser: boolean;
  trust_score: number;
  date_joined: string | null;
};

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/control/admin/users/${encodeURIComponent(id)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!res.ok) notFound();
  const data = await res.json();
  const user: AdminUser = data.user;

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
          <div className="control-list-row"><div className="control-list-row-title">Phone</div><span>{user.phone || "—"}</span></div>
          <div className="control-list-row"><div className="control-list-row-title">Country</div><span>{user.country || "—"}</span></div>
          <div className="control-list-row"><div className="control-list-row-title">Trust score</div><span>{user.trust_score}</span></div>
          <div className="control-list-row"><div className="control-list-row-title">Joined</div><span>{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "—"}</span></div>
        </div>
      </section>

      <UserActions userId={user.id} status={user.status} tier={user.tier} />
    </>
  );
}
