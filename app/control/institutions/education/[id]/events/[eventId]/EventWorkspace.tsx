"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EducationEvent = {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  event_type: string;
  starts_at: string;
  ends_at: string;
  delivery_mode?: string;
  location_text?: string;
  meeting_url?: string;
  seat_limit?: number | null;
  status: string;
};

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function patchJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

async function del(url: string) {
  const res = await fetch(url, { method: "DELETE" });
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.message || "Request failed.");
}

export default function EventWorkspace({
  institutionId,
  eventId,
  initialEvent,
}: {
  institutionId: string;
  eventId: string;
  initialEvent: EducationEvent;
}) {
  const router = useRouter();
  const basePath = `/api/control/education/institutions/${institutionId}/events/${eventId}`;
  const [event, setEvent] = useState(initialEvent);
  const [startsAt, setStartsAt] = useState(toLocalInput(initialEvent.starts_at));
  const [endsAt, setEndsAt] = useState(toLocalInput(initialEvent.ends_at));
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [saving, setSaving] = useState(false);
  async function saveEvent(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data = await patchJson(basePath, {
        title: event.title,
        summary: event.summary,
        description: event.description,
        event_type: event.event_type,
        starts_at: startsAt ? new Date(startsAt).toISOString() : undefined,
        ends_at: endsAt ? new Date(endsAt).toISOString() : undefined,
        delivery_mode: event.delivery_mode,
        location_text: event.location_text,
        meeting_url: event.meeting_url,
        seat_limit: event.seat_limit,
        status: event.status,
      });
      setEvent(data.event);
      setStartsAt(toLocalInput(data.event.starts_at));
      setEndsAt(toLocalInput(data.event.ends_at));
      setMessage({ kind: "success", text: "Event saved." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save event." });
    } finally {
      setSaving(false);
    }
  }

  const [deleting, setDeleting] = useState(false);
  async function deleteEvent() {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await del(basePath);
      router.push(`/control/institutions/education/${institutionId}/events`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete event." });
      setDeleting(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Event details</h2>
      <form className="control-form" onSubmit={saveEvent}>
        <label>Title<input value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} required /></label>
        <label>
          Type
          <select value={event.event_type} onChange={(e) => setEvent({ ...event, event_type: e.target.value })}>
            <option value="event">Event</option>
            <option value="training_session">Training Session</option>
          </select>
        </label>
        <label>Summary<textarea rows={2} value={event.summary || ""} onChange={(e) => setEvent({ ...event, summary: e.target.value })} /></label>
        <label>Description<textarea rows={4} value={event.description || ""} onChange={(e) => setEvent({ ...event, description: e.target.value })} /></label>
        <label>Starts at<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required /></label>
        <label>Ends at<input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required /></label>
        <label>
          Delivery mode
          <select value={event.delivery_mode || "online"} onChange={(e) => setEvent({ ...event, delivery_mode: e.target.value })}>
            <option value="online">Online</option>
            <option value="in_person">In person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        {event.delivery_mode !== "in_person" ? (
          <label>Meeting URL<input type="url" value={event.meeting_url || ""} onChange={(e) => setEvent({ ...event, meeting_url: e.target.value })} placeholder="https://…" /></label>
        ) : null}
        {event.delivery_mode !== "online" ? (
          <label>Location<input value={event.location_text || ""} onChange={(e) => setEvent({ ...event, location_text: e.target.value })} /></label>
        ) : null}
        <label>Seat limit<input type="number" min={1} value={event.seat_limit || ""} onChange={(e) => setEvent({ ...event, seat_limit: e.target.value ? Number(e.target.value) : null })} placeholder="Unlimited" /></label>
        <label>
          Status
          <select value={event.status} onChange={(e) => setEvent({ ...event, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          <button type="button" className="button" onClick={deleteEvent} disabled={deleting}>{deleting ? "Deleting…" : "Delete event"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
