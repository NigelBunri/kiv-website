import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import MaterialCreateForm from "./MaterialCreateForm";
import MediaPreview from "@/app/control/MediaPreview";

type Material = { id: string; title: string; kind: string; status: string; safe_resource_url?: string };
type Course = { id: string; title: string };

export default async function MaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const [materialsRes, coursesRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/materials/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/courses/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!materialsRes.ok) notFound();
  const materialsData = await materialsRes.json();
  const materials: Material[] = Array.isArray(materialsData?.materials) ? materialsData.materials : [];
  const coursesData = coursesRes.ok ? await coursesRes.json() : {};
  const courses: Course[] = Array.isArray(coursesData?.courses) ? coursesData.courses : [];

  return (
    <>
      <div className="control-header">
        <h1>Materials</h1>
        <p>Videos, documents, slides, and links — attach these to course modules from a course&rsquo;s page.</p>
      </div>

      <MaterialCreateForm institutionId={id} courses={courses} />

      <section className="control-section">
        <h2>All materials</h2>
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
                <span className={`control-badge control-badge--${m.status === "published" ? "active" : m.status === "archived" ? "inactive" : "pending"}`}>{m.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
