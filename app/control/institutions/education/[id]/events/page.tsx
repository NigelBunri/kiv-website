import Link from "next/link";
import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import EventCreateForm from "./EventCreateForm";
import { BackLink } from "@/app/control/BackLink";

type EducationEvent = { id: string; title: string; starts_at: string; ends_at: string; status: string };

export default async function EventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/events/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) notFound();
  const data = await res.json();
  const events: EducationEvent[] = Array.isArray(data?.events) ? data.events : [];

  return (
    <>
      <BackLink href={`/control/institutions/education/${id}`} label="Back to institution" />
      <div className="control-header">
        <h1>Events</h1>
        <p>One-off events for your institution - open days, webinars, graduations.</p>
      </div>

      <EventCreateForm institutionId={id} />

      <section className="control-section">
        <h2>All events</h2>
        {events.length === 0 ? (
          <div className="control-empty">No events yet.</div>
        ) : (
          <div className="control-list">
            {events.map((e) => (
              <Link key={e.id} href={`/control/institutions/education/${id}/events/${e.id}`} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{e.title}</div>
                  <div className="control-list-row-meta">{new Date(e.starts_at).toLocaleString()}</div>
                </div>
                <span className={`control-badge control-badge--${e.status === "published" ? "active" : e.status === "archived" ? "inactive" : "pending"}`}>{e.status}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
