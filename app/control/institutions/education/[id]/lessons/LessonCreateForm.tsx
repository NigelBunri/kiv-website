"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LessonCreateForm({ institutionId, courses }: { institutionId: string; courses: { id: string; title: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, course_id: courseId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to add lesson.");
      setTitle(""); setContent("");
      setMessage({ kind: "success", text: "Lesson added." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add lesson." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>New lesson</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>
          Course
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label>Content<textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} /></label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !title.trim()}>{creating ? "Adding…" : "Add lesson"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
