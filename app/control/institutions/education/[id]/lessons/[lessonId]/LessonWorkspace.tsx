"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lesson = {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  course_id?: string;
  lesson_order?: number;
  duration_minutes?: number;
  is_preview?: boolean;
  status: string;
};

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

export default function LessonWorkspace({
  institutionId,
  lessonId,
  initialLesson,
  courses,
}: {
  institutionId: string;
  lessonId: string;
  initialLesson: Lesson;
  courses: { id: string; title: string }[];
}) {
  const router = useRouter();
  const basePath = `/api/control/education/institutions/${institutionId}/lessons/${lessonId}`;
  const [lesson, setLesson] = useState(initialLesson);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [saving, setSaving] = useState(false);
  async function saveLesson(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data = await patchJson(basePath, {
        title: lesson.title,
        course_id: lesson.course_id,
        summary: lesson.summary,
        content: lesson.content,
        lesson_order: lesson.lesson_order,
        duration_minutes: lesson.duration_minutes,
        is_preview: lesson.is_preview,
        status: lesson.status,
      });
      setLesson(data.lesson);
      setMessage({ kind: "success", text: "Lesson saved." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save lesson." });
    } finally {
      setSaving(false);
    }
  }

  const [deleting, setDeleting] = useState(false);
  async function deleteLesson() {
    if (!confirm(`Delete "${lesson.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await del(basePath);
      router.push(`/control/institutions/education/${institutionId}/lessons`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete lesson." });
      setDeleting(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Lesson details</h2>
      <form className="control-form" onSubmit={saveLesson}>
        <label>Title<input value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} required /></label>
        <label>
          Course
          <select value={lesson.course_id || ""} onChange={(e) => setLesson({ ...lesson, course_id: e.target.value })}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label>Summary<textarea rows={2} value={lesson.summary || ""} onChange={(e) => setLesson({ ...lesson, summary: e.target.value })} /></label>
        <label>Content<textarea rows={6} value={lesson.content || ""} onChange={(e) => setLesson({ ...lesson, content: e.target.value })} /></label>
        <label>Order<input type="number" min={0} value={lesson.lesson_order || 0} onChange={(e) => setLesson({ ...lesson, lesson_order: Number(e.target.value) })} /></label>
        <label>Duration (minutes)<input type="number" min={0} value={lesson.duration_minutes || 0} onChange={(e) => setLesson({ ...lesson, duration_minutes: Number(e.target.value) })} /></label>
        <label>
          <input type="checkbox" checked={Boolean(lesson.is_preview)} onChange={(e) => setLesson({ ...lesson, is_preview: e.target.checked })} /> Free preview (viewable without enrolling)
        </label>
        <label>
          Status
          <select value={lesson.status} onChange={(e) => setLesson({ ...lesson, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          <button type="button" className="button" onClick={deleteLesson} disabled={deleting}>{deleting ? "Deleting…" : "Delete lesson"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
