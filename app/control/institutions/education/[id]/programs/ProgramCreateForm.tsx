"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProgramCreateForm({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("draft");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/programs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, code, summary, status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create program.");
      setTitle(""); setCode(""); setSummary(""); setStatus("draft");
      setMessage({ kind: "success", text: "Program created." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create program." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>New program</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Code<input value={code} onChange={(e) => setCode(e.target.value)} /></label>
        <label>Summary<textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} /></label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !title.trim()}>{creating ? "Creating…" : "Create program"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
