import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ClassSessionCreateForm from "./ClassSessionCreateForm";

type ClassSession = { id: string; title: string; starts_at: string; ends_at: string; delivery_mode: string; status: string };

export default async function ClassSessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/class-sessions/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) notFound();
  const data = await res.json();
  const sessions: ClassSession[] = Array.isArray(data?.class_sessions) ? data.class_sessions : [];

  return (
    <>
      <div className="control-header">
        <h1>Class sessions</h1>
        <p>Scheduled live/online class meetings.</p>
      </div>

      <ClassSessionCreateForm institutionId={id} />

      <section className="control-section">
        <h2>All class sessions</h2>
        {sessions.length === 0 ? (
          <div className="control-empty">No class sessions yet.</div>
        ) : (
          <div className="control-list">
            {sessions.map((s) => (
              <div key={s.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{s.title}</div>
                  <div className="control-list-row-meta">
                    {new Date(s.starts_at).toLocaleString()} · {s.delivery_mode}
                  </div>
                </div>
                <span className={`control-badge control-badge--${s.status === "scheduled" ? "active" : s.status === "cancelled" ? "inactive" : "pending"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
