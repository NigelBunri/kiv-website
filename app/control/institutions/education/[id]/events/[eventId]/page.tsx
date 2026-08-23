import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import EventWorkspace from "./EventWorkspace";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(
    `${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/events/${encodeURIComponent(eventId)}/`,
    { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) },
  );
  if (!res.ok) notFound();
  const data = await res.json();

  return (
    <>
      <div className="control-header">
        <h1>{data?.event?.title || "Event"}</h1>
        <p>Manage this event&rsquo;s schedule and details.</p>
      </div>
      <EventWorkspace institutionId={id} eventId={eventId} initialEvent={data?.event} />
    </>
  );
}
