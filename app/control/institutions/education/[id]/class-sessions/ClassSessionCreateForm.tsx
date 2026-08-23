"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClassSessionCreateForm({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("online");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [locationText, setLocationText] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/class-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
          delivery_mode: deliveryMode,
          meeting_url: meetingUrl,
          location_text: locationText,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create class session.");
      setTitle(""); setStartsAt(""); setEndsAt(""); setMeetingUrl(""); setLocationText("");
      setMessage({ kind: "success", text: "Class session created." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create class session." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>New class session</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Starts at<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required /></label>
        <label>Ends at<input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required /></label>
        <label>
          Delivery mode
          <select value={deliveryMode} onChange={(e) => setDeliveryMode(e.target.value)}>
            <option value="online">Online</option>
            <option value="in_person">In person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        {deliveryMode !== "in_person" ? (
          <label>Meeting URL<input type="url" value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://…" /></label>
        ) : null}
        {deliveryMode !== "online" ? (
          <label>Location<input value={locationText} onChange={(e) => setLocationText(e.target.value)} /></label>
        ) : null}
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !title.trim() || !startsAt || !endsAt}>
            {creating ? "Creating…" : "Create class session"}
          </button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
