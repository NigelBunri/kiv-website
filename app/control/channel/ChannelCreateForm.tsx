"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChannelCreateForm() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/channel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, display_name: displayName, description }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create channel.");
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create channel." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Create your channel</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>
          Handle
          <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="your-handle" required />
        </label>
        <label>
          Display name
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !handle.trim() || !displayName.trim()}>
            {creating ? "Creating…" : "Create channel"}
          </button>
        </div>
      </form>
      {message ? <p className="control-error">{message.text}</p> : null}
    </section>
  );
}
