"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShopCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/shops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create shop.");
      const id = data.data?.id;
      if (id) {
        router.push(`/control/shops/${id}`);
      } else {
        router.refresh();
      }
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create shop." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Create a shop</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riverside Market" required />
        </label>
        <label>
          Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !name.trim()}>
            {creating ? "Creating…" : "Create shop"}
          </button>
        </div>
      </form>
      {message ? <p className="control-error">{message.text}</p> : null}
    </section>
  );
}
