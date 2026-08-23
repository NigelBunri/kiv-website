"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Program = {
  id: string;
  title: string;
  code?: string;
  summary?: string;
  description?: string;
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

export default function ProgramWorkspace({
  institutionId,
  programId,
  initialProgram,
}: {
  institutionId: string;
  programId: string;
  initialProgram: Program;
}) {
  const router = useRouter();
  const basePath = `/api/control/education/institutions/${institutionId}/programs/${programId}`;
  const [program, setProgram] = useState(initialProgram);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [saving, setSaving] = useState(false);
  async function saveProgram(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data = await patchJson(basePath, {
        title: program.title,
        code: program.code,
        summary: program.summary,
        description: program.description,
        status: program.status,
      });
      setProgram(data.program);
      setMessage({ kind: "success", text: "Program saved." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save program." });
    } finally {
      setSaving(false);
    }
  }

  const [deleting, setDeleting] = useState(false);
  async function deleteProgram() {
    if (!confirm(`Delete "${program.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await del(basePath);
      router.push(`/control/institutions/education/${institutionId}/programs`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete program." });
      setDeleting(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Program details</h2>
      <form className="control-form" onSubmit={saveProgram}>
        <label>Title<input value={program.title} onChange={(e) => setProgram({ ...program, title: e.target.value })} required /></label>
        <label>Code<input value={program.code || ""} onChange={(e) => setProgram({ ...program, code: e.target.value })} /></label>
        <label>Summary<textarea rows={2} value={program.summary || ""} onChange={(e) => setProgram({ ...program, summary: e.target.value })} /></label>
        <label>Description<textarea rows={4} value={program.description || ""} onChange={(e) => setProgram({ ...program, description: e.target.value })} /></label>
        <label>
          Status
          <select value={program.status} onChange={(e) => setProgram({ ...program, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          <button type="button" className="button" onClick={deleteProgram} disabled={deleting}>{deleting ? "Deleting…" : "Delete program"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
