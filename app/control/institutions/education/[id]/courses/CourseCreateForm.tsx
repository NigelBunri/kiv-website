"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CourseCreateForm({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("draft");
  const [visibility, setVisibility] = useState("public");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          code,
          summary,
          status,
          visibility,
          duration_minutes: durationMinutes ? Number(durationMinutes) : 0,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create the course.");
      const newCourseId = data.data?.course?.id;
      setTitle(""); setCode(""); setSummary(""); setDurationMinutes(""); setStatus("draft"); setVisibility("public");
      setMessage({ kind: "success", text: "Course created." });
      router.refresh();
      if (newCourseId) router.push(`/control/institutions/education/${institutionId}/courses/${newCourseId}`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create the course." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>New course</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          Code
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. BIB-101" />
        </label>
        <label>
          Summary
          <textarea rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} />
        </label>
        <label>
          Duration (minutes)
          <input type="number" min={0} value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          Visibility
          <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !title.trim()}>
            {creating ? "Creating…" : "Create course"}
          </button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
