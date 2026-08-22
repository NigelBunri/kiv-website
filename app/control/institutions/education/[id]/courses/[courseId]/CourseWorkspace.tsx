"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaPreview from "@/app/control/MediaPreview";

type Course = {
  id: string;
  title: string;
  code?: string;
  summary?: string;
  description?: string;
  status: string;
  visibility: string;
  duration_minutes?: number;
  price_amount?: string | number;
};

type ModuleItem = {
  id: string;
  item_type: "lesson" | "material" | "class_session" | "assessment" | "event" | "broadcast";
  item_order: number;
  title_override?: string;
  estimated_minutes?: number;
  lesson_id?: string | null;
  material_id?: string | null;
};

type Module = {
  id: string;
  title: string;
  summary?: string;
  module_order: number;
  is_preview: boolean;
  status: string;
  items: ModuleItem[];
};

type Lesson = { id: string; title: string; status: string };
type Material = { id: string; title: string; kind: string; status: string; safe_resource_url?: string };

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

export default function CourseWorkspace({
  institutionId,
  courseId,
  initialCourse,
  initialModules,
  initialLessons,
  initialMaterials,
}: {
  institutionId: string;
  courseId: string;
  initialCourse: Course;
  initialModules: Module[];
  initialLessons: Lesson[];
  initialMaterials: Material[];
}) {
  const router = useRouter();
  const basePath = `/api/control/education/institutions/${institutionId}`;

  const [course, setCourse] = useState(initialCourse);
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const lessonTitle = (id?: string | null) => lessons.find((l) => l.id === id)?.title;
  const materialTitle = (id?: string | null) => materials.find((m) => m.id === id)?.title;

  // ---- Course fields ----
  const [savingCourse, setSavingCourse] = useState(false);
  async function saveCourse(event: React.FormEvent) {
    event.preventDefault();
    setSavingCourse(true);
    setMessage(null);
    try {
      const data = await patchJson(`${basePath}/courses/${courseId}`, {
        title: course.title,
        code: course.code,
        summary: course.summary,
        description: course.description,
        status: course.status,
        visibility: course.visibility,
        duration_minutes: course.duration_minutes,
        price_amount: course.price_amount,
      });
      setCourse(data.course);
      setMessage({ kind: "success", text: "Course saved." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save course." });
    } finally {
      setSavingCourse(false);
    }
  }

  const [deletingCourse, setDeletingCourse] = useState(false);
  async function deleteCourse() {
    if (!confirm(`Delete "${course.title}"? This removes its modules and cannot be undone.`)) return;
    setDeletingCourse(true);
    try {
      await del(`${basePath}/courses/${courseId}`);
      router.push(`/control/institutions/education/${institutionId}/courses`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete course." });
      setDeletingCourse(false);
    }
  }

  // ---- Materials (with real upload) ----
  const [materialTitleInput, setMaterialTitleInput] = useState("");
  const [materialKind, setMaterialKind] = useState("video");
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialUploading, setMaterialUploading] = useState(false);
  const [materialUploadProgress, setMaterialUploadProgress] = useState("");

  async function createMaterial(event: React.FormEvent) {
    event.preventDefault();
    setMaterialUploading(true);
    setMessage(null);
    try {
      let resourceAttachment: { media_id: string } | undefined;
      let resourceUrl = materialUrl.trim();

      if (materialFile) {
        setMaterialUploadProgress("Starting upload…");
        const initiate = await postJson(`/api/control/education/uploads/initiate`, {
          filename: materialFile.name,
          content_type: materialFile.type || "application/octet-stream",
          size_bytes: materialFile.size,
        });
        setMaterialUploadProgress("Uploading…");
        const putRes = await fetch(initiate.uploadUrl, {
          method: "PUT",
          headers: initiate.headers,
          body: materialFile,
        });
        if (!putRes.ok) throw new Error("File upload to storage failed.");
        setMaterialUploadProgress("Confirming…");
        const confirmed = await postJson(`/api/control/education/uploads/${initiate.uploadId}/confirm`, {});
        resourceAttachment = { media_id: confirmed.mediaId || confirmed.upload_id };
        resourceUrl = "";
      }

      const data = await postJson(`${basePath}/materials`, {
        title: materialTitleInput,
        kind: materialKind,
        course_ids: [courseId],
        resource_url: resourceUrl || undefined,
        resource_attachment: resourceAttachment,
      });
      setMaterials((prev) => [...prev, data.material]);
      setMaterialTitleInput(""); setMaterialUrl(""); setMaterialFile(null);
      setMessage({ kind: "success", text: "Material added." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add material." });
    } finally {
      setMaterialUploading(false);
      setMaterialUploadProgress("");
    }
  }

  // ---- Lessons ----
  const [lessonTitleInput, setLessonTitleInput] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [creatingLesson, setCreatingLesson] = useState(false);
  async function createLesson(event: React.FormEvent) {
    event.preventDefault();
    setCreatingLesson(true);
    setMessage(null);
    try {
      const data = await postJson(`${basePath}/lessons`, { title: lessonTitleInput, content: lessonContent, course_id: courseId });
      setLessons((prev) => [...prev, data.lesson]);
      setLessonTitleInput(""); setLessonContent("");
      setMessage({ kind: "success", text: "Lesson added." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add lesson." });
    } finally {
      setCreatingLesson(false);
    }
  }

  // ---- Modules ----
  const [moduleTitleInput, setModuleTitleInput] = useState("");
  const [creatingModule, setCreatingModule] = useState(false);
  async function createModule(event: React.FormEvent) {
    event.preventDefault();
    setCreatingModule(true);
    setMessage(null);
    try {
      const data = await postJson(`${basePath}/courses/${courseId}/modules`, { title: moduleTitleInput, module_order: modules.length });
      setModules((prev) => [...prev, { ...data.module, items: [] }]);
      setModuleTitleInput("");
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add module." });
    } finally {
      setCreatingModule(false);
    }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Delete this module and all its items?")) return;
    try {
      await del(`${basePath}/courses/${courseId}/modules/${moduleId}`);
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete module." });
    }
  }

  // ---- Module items ----
  const [itemDrafts, setItemDrafts] = useState<Record<string, { item_type: "lesson" | "material"; ref_id: string }>>({});
  function itemDraft(moduleId: string) {
    return itemDrafts[moduleId] || { item_type: "lesson" as const, ref_id: "" };
  }
  function setItemDraft(moduleId: string, next: Partial<{ item_type: "lesson" | "material"; ref_id: string }>) {
    setItemDrafts((prev) => ({ ...prev, [moduleId]: { ...itemDraft(moduleId), ...next } }));
  }

  async function addItem(moduleId: string) {
    const draft = itemDraft(moduleId);
    if (!draft.ref_id) return;
    setMessage(null);
    try {
      const body: Record<string, unknown> = { item_type: draft.item_type, item_order: (modules.find((m) => m.id === moduleId)?.items.length) || 0 };
      if (draft.item_type === "lesson") body.lesson_id = draft.ref_id;
      if (draft.item_type === "material") body.material_id = draft.ref_id;
      const data = await postJson(`${basePath}/courses/${courseId}/modules/${moduleId}/items`, body);
      setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, items: [...m.items, data.item] } : m)));
      setItemDraft(moduleId, { ref_id: "" });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add item." });
    }
  }

  async function deleteItem(moduleId: string, itemId: string) {
    try {
      await del(`${basePath}/courses/${courseId}/modules/${moduleId}/items/${itemId}`);
      setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, items: m.items.filter((i) => i.id !== itemId) } : m)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to remove item." });
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>Course details</h2>
        <form className="control-form" onSubmit={saveCourse}>
          <label>Title<input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} required /></label>
          <label>Code<input value={course.code || ""} onChange={(e) => setCourse({ ...course, code: e.target.value })} /></label>
          <label>Summary<textarea rows={2} value={course.summary || ""} onChange={(e) => setCourse({ ...course, summary: e.target.value })} /></label>
          <label>Description<textarea rows={4} value={course.description || ""} onChange={(e) => setCourse({ ...course, description: e.target.value })} /></label>
          <label>Duration (minutes)<input type="number" min={0} value={course.duration_minutes || 0} onChange={(e) => setCourse({ ...course, duration_minutes: Number(e.target.value) })} /></label>
          <label>
            Status
            <select value={course.status} onChange={(e) => setCourse({ ...course, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            Visibility
            <select value={course.visibility} onChange={(e) => setCourse({ ...course, visibility: e.target.value })}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={savingCourse}>{savingCourse ? "Saving…" : "Save changes"}</button>
            <button type="button" className="button" onClick={deleteCourse} disabled={deletingCourse}>{deletingCourse ? "Deleting…" : "Delete course"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>Materials</h2>
        <p>Videos, documents, slides, and links available to attach to modules below.</p>
        <form className="control-form" onSubmit={createMaterial}>
          <label>Title<input value={materialTitleInput} onChange={(e) => setMaterialTitleInput(e.target.value)} required /></label>
          <label>
            Kind
            <select value={materialKind} onChange={(e) => setMaterialKind(e.target.value)}>
              {MATERIAL_KIND_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          {materialKind === "link" ? (
            <label>Link URL<input type="url" value={materialUrl} onChange={(e) => setMaterialUrl(e.target.value)} placeholder="https://…" /></label>
          ) : (
            <label>
              File (video/document/audio, up to 5 GB)
              <input type="file" onChange={(e) => setMaterialFile(e.target.files?.[0] || null)} />
            </label>
          )}
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={materialUploading || !materialTitleInput.trim()}>
              {materialUploading ? (materialUploadProgress || "Working…") : "Add material"}
            </button>
          </div>
        </form>
        {materials.length === 0 ? (
          <div className="control-empty">No materials yet.</div>
        ) : (
          <div className="control-list">
            {materials.map((m) => (
              <div key={m.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{m.title}</div>
                  <div className="control-list-row-meta">{m.kind}</div>
                </div>
                <MediaPreview kind={m.kind} url={m.safe_resource_url} title={m.title} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="control-section">
        <h2>Lessons</h2>
        <form className="control-form" onSubmit={createLesson}>
          <label>Title<input value={lessonTitleInput} onChange={(e) => setLessonTitleInput(e.target.value)} required /></label>
          <label>Content<textarea rows={4} value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} /></label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={creatingLesson || !lessonTitleInput.trim()}>{creatingLesson ? "Adding…" : "Add lesson"}</button>
          </div>
        </form>
        {lessons.length === 0 ? <div className="control-empty">No lessons yet.</div> : (
          <div className="control-list">
            {lessons.map((l) => (
              <div key={l.id} className="control-list-row"><div className="control-list-row-title">{l.title}</div></div>
            ))}
          </div>
        )}
      </section>

      <section className="control-section">
        <h2>Modules</h2>
        <p>Structure the course into modules, then add lessons or materials as items in order.</p>
        <form className="control-form" onSubmit={createModule}>
          <label>New module title<input value={moduleTitleInput} onChange={(e) => setModuleTitleInput(e.target.value)} required /></label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={creatingModule || !moduleTitleInput.trim()}>{creatingModule ? "Adding…" : "Add module"}</button>
          </div>
        </form>

        {modules.length === 0 ? (
          <div className="control-empty">No modules yet. Add one above.</div>
        ) : (
          <div className="control-list">
            {modules.map((module) => (
              <div key={module.id} className="control-list-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="control-list-row-title">{module.title}</div>
                  <button type="button" className="button" onClick={() => deleteModule(module.id)}>Delete module</button>
                </div>

                {module.items.length === 0 ? (
                  <div className="control-empty">No items in this module yet.</div>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                    {module.items.map((item) => (
                      <li key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                        <span>
                          {item.title_override || (item.item_type === "lesson" ? lessonTitle(item.lesson_id) : item.item_type === "material" ? materialTitle(item.material_id) : item.item_type) || "Untitled item"}
                          {" "}<em>({item.item_type})</em>
                        </span>
                        <button type="button" className="button" onClick={() => deleteItem(module.id, item.id)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <select value={itemDraft(module.id).item_type} onChange={(e) => setItemDraft(module.id, { item_type: e.target.value as "lesson" | "material", ref_id: "" })}>
                    <option value="lesson">Lesson</option>
                    <option value="material">Material</option>
                  </select>
                  <select value={itemDraft(module.id).ref_id} onChange={(e) => setItemDraft(module.id, { ref_id: e.target.value })}>
                    <option value="">Select…</option>
                    {(itemDraft(module.id).item_type === "lesson" ? lessons : materials).map((row) => (
                      <option key={row.id} value={row.id}>{row.title}</option>
                    ))}
                  </select>
                  <button type="button" className="button" onClick={() => addItem(module.id)} disabled={!itemDraft(module.id).ref_id}>Add to module</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
