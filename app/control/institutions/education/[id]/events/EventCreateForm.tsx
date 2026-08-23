"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EventCreateForm({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [summary, setSummary] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
          summary,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create event.");
      setTitle(""); setStartsAt(""); setEndsAt(""); setSummary("");
      setMessage({ kind: "success", text: "Event created." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create event." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>New event</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Starts at<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required /></label>
        <label>Ends at<input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required /></label>
        <label>Summary<textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} /></label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !title.trim() || !startsAt || !endsAt}>
            {creating ? "Creating…" : "Create event"}
          </button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
