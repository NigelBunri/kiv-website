import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import CourseCreateForm from "./CourseCreateForm";

type Course = {
  id: string;
  title: string;
  code?: string;
  summary?: string;
  status: string;
  visibility: string;
  duration_minutes?: number;
  price_amount?: string | number;
};

export default async function CoursesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/courses/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) notFound();
  const data = await res.json();
  const courses: Course[] = Array.isArray(data?.courses) ? data.courses : [];

  return (
    <>
      <div className="control-header">
        <h1>Courses</h1>
        <p>Create and manage this institution&rsquo;s courses.</p>
      </div>

      <CourseCreateForm institutionId={id} />

      <section className="control-section">
        <h2>All courses</h2>
        {courses.length === 0 ? (
          <div className="control-empty">No courses yet. Create the first one above.</div>
        ) : (
          <div className="control-list">
            {courses.map((course) => (
              <a key={course.id} href={`/control/institutions/education/${id}/courses/${course.id}`} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{course.title}</div>
                  <div className="control-list-row-meta">
                    {course.code ? `${course.code} · ` : ""}
                    {course.duration_minutes ? `${course.duration_minutes} min · ` : ""}
                    {course.visibility}
                  </div>
                </div>
                <span className={`control-badge control-badge--${course.status === "published" ? "active" : course.status === "archived" ? "inactive" : "pending"}`}>
                  {course.status}
                </span>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
