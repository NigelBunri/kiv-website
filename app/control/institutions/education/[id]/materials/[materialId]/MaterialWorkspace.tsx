"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MATERIAL_KIND_OPTIONS = [
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
  { value: "slides", label: "Slides" },
  { value: "assignment", label: "Assignment" },
  { value: "reference", label: "Reference" },
  { value: "link", label: "Link" },
];

type Material = {
  id: string;
  title: string;
  summary?: string;
  kind: string;
  resource_url?: string;
  is_downloadable?: boolean;
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

export default function MaterialWorkspace({
  institutionId,
  materialId,
  initialMaterial,
}: {
  institutionId: string;
  materialId: string;
  initialMaterial: Material;
}) {
  const router = useRouter();
  const basePath = `/api/control/education/institutions/${institutionId}/materials/${materialId}`;
  const [material, setMaterial] = useState(initialMaterial);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [saving, setSaving] = useState(false);
  async function saveMaterial(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data = await patchJson(basePath, {
        title: material.title,
        summary: material.summary,
        kind: material.kind,
        resource_url: material.resource_url,
        is_downloadable: material.is_downloadable,
        status: material.status,
      });
      setMaterial(data.material);
      setMessage({ kind: "success", text: "Material saved." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save material." });
    } finally {
      setSaving(false);
    }
  }

  const [deleting, setDeleting] = useState(false);
  async function deleteMaterial() {
    if (!confirm(`Delete "${material.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await del(basePath);
      router.push(`/control/institutions/education/${institutionId}/materials`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete material." });
      setDeleting(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Material details</h2>
      <form className="control-form" onSubmit={saveMaterial}>
        <label>Title<input value={material.title} onChange={(e) => setMaterial({ ...material, title: e.target.value })} required /></label>
        <label>Summary<textarea rows={2} value={material.summary || ""} onChange={(e) => setMaterial({ ...material, summary: e.target.value })} /></label>
        <label>
          Kind
          <select value={material.kind} onChange={(e) => setMaterial({ ...material, kind: e.target.value })}>
            {MATERIAL_KIND_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label>Resource URL<input type="url" value={material.resource_url || ""} onChange={(e) => setMaterial({ ...material, resource_url: e.target.value })} placeholder="https://…" /></label>
        <label>
          <input type="checkbox" checked={Boolean(material.is_downloadable)} onChange={(e) => setMaterial({ ...material, is_downloadable: e.target.checked })} /> Downloadable
        </label>
        <label>
          Status
          <select value={material.status} onChange={(e) => setMaterial({ ...material, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          <button type="button" className="button" onClick={deleteMaterial} disabled={deleting}>{deleting ? "Deleting…" : "Delete material"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
