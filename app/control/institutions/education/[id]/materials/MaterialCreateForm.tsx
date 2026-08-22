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

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

export default function MaterialCreateForm({ institutionId, courses }: { institutionId: string; courses: { id: string; title: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("video");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setUploading(true);
    setMessage(null);
    try {
      let resourceAttachment: { media_id: string } | undefined;
      let resourceUrl = url.trim();

      if (file) {
        setProgress("Starting upload…");
        const initiate = await postJson(`/api/control/education/uploads/initiate`, {
          filename: file.name,
          content_type: file.type || "application/octet-stream",
          size_bytes: file.size,
        });
        setProgress("Uploading…");
        const putRes = await fetch(initiate.uploadUrl, { method: "PUT", headers: initiate.headers, body: file });
        if (!putRes.ok) throw new Error("File upload to storage failed.");
        setProgress("Confirming…");
        const confirmed = await postJson(`/api/control/education/uploads/${initiate.uploadId}/confirm`, {});
        resourceAttachment = { media_id: confirmed.mediaId || confirmed.upload_id };
        resourceUrl = "";
      }

      await postJson(`/api/control/education/institutions/${institutionId}/materials`, {
        title,
        kind,
        course_ids: courseId ? [courseId] : undefined,
        resource_url: resourceUrl || undefined,
        resource_attachment: resourceAttachment,
      });
      setTitle(""); setUrl(""); setFile(null); setCourseId("");
      setMessage({ kind: "success", text: "Material added." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add material." });
    } finally {
      setUploading(false);
      setProgress("");
    }
  }

  return (
    <section className="control-section">
      <h2>New material</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>
          Kind
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            {MATERIAL_KIND_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        {kind === "link" ? (
          <label>Link URL<input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></label>
        ) : (
          <label>File (video/document/audio, up to 5 GB)<input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        )}
        {courses.length > 0 ? (
          <label>
            Attach to course (optional)
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">None yet</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
        ) : null}
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={uploading || !title.trim()}>
            {uploading ? (progress || "Working…") : "Add material"}
          </button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
