"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClassSession = {
  id: string;
  title: string;
  summary?: string;
  course_id?: string | null;
  lesson_id?: string | null;
  starts_at: string;
  ends_at: string;
  delivery_mode: string;
  location_text?: string;
  meeting_url?: string;
  seat_limit?: number | null;
  status: string;
};

// datetime-local inputs need "YYYY-MM-DDTHH:mm" - trims the seconds/ms and
// timezone designator ISO strings from the API carry.
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

export default function ClassSessionWorkspace({
  institutionId,
  sessionId,
  initialSession,
}: {
  institutionId: string;
  sessionId: string;
  initialSession: ClassSession;
}) {
  const router = useRouter();
  const basePath = `/api/control/education/institutions/${institutionId}/class-sessions/${sessionId}`;
  const [session, setSession] = useState(initialSession);
  const [startsAt, setStartsAt] = useState(toLocalInput(initialSession.starts_at));
  const [endsAt, setEndsAt] = useState(toLocalInput(initialSession.ends_at));
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [saving, setSaving] = useState(false);
  async function saveSession(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data = await patchJson(basePath, {
        title: session.title,
        summary: session.summary,
        starts_at: startsAt ? new Date(startsAt).toISOString() : undefined,
        ends_at: endsAt ? new Date(endsAt).toISOString() : undefined,
        delivery_mode: session.delivery_mode,
        location_text: session.location_text,
        meeting_url: session.meeting_url,
        seat_limit: session.seat_limit,
        status: session.status,
      });
      setSession(data.class_session);
      setStartsAt(toLocalInput(data.class_session.starts_at));
      setEndsAt(toLocalInput(data.class_session.ends_at));
      setMessage({ kind: "success", text: "Class session saved." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save class session." });
    } finally {
      setSaving(false);
    }
  }

  const [deleting, setDeleting] = useState(false);
  async function deleteSession() {
    if (!confirm(`Delete "${session.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await del(basePath);
      router.push(`/control/institutions/education/${institutionId}/class-sessions`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete class session." });
      setDeleting(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Class session details</h2>
      <form className="control-form" onSubmit={saveSession}>
        <label>Title<input value={session.title} onChange={(e) => setSession({ ...session, title: e.target.value })} required /></label>
        <label>Summary<textarea rows={2} value={session.summary || ""} onChange={(e) => setSession({ ...session, summary: e.target.value })} /></label>
        <label>Starts at<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required /></label>
        <label>Ends at<input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required /></label>
        <label>
          Delivery mode
          <select value={session.delivery_mode} onChange={(e) => setSession({ ...session, delivery_mode: e.target.value })}>
            <option value="online">Online</option>
            <option value="in_person">In person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        {session.delivery_mode !== "in_person" ? (
          <label>Meeting URL<input type="url" value={session.meeting_url || ""} onChange={(e) => setSession({ ...session, meeting_url: e.target.value })} placeholder="https://…" /></label>
        ) : null}
        {session.delivery_mode !== "online" ? (
          <label>Location<input value={session.location_text || ""} onChange={(e) => setSession({ ...session, location_text: e.target.value })} /></label>
        ) : null}
        <label>Seat limit<input type="number" min={1} value={session.seat_limit || ""} onChange={(e) => setSession({ ...session, seat_limit: e.target.value ? Number(e.target.value) : null })} placeholder="Unlimited" /></label>
        <label>
          Status
          <select value={session.status} onChange={(e) => setSession({ ...session, status: e.target.value })}>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          <button type="button" className="button" onClick={deleteSession} disabled={deleting}>{deleting ? "Deleting…" : "Delete class session"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
