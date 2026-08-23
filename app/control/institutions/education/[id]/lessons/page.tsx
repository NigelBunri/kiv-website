import Link from "next/link";
import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import LessonCreateForm from "./LessonCreateForm";

type Lesson = { id: string; title: string; status: string };
type Course = { id: string; title: string };

export default async function LessonsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const [lessonsRes, coursesRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/lessons/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/courses/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!lessonsRes.ok) notFound();
  const lessonsData = await lessonsRes.json();
  const lessons: Lesson[] = Array.isArray(lessonsData?.lessons) ? lessonsData.lessons : [];
  const coursesData = coursesRes.ok ? await coursesRes.json() : {};
  const courses: Course[] = Array.isArray(coursesData?.courses) ? coursesData.courses : [];

  return (
    <>
      <div className="control-header">
        <h1>Lessons</h1>
        <p>Text-based lesson content — attach these to course modules from a course&rsquo;s page.</p>
      </div>

      {courses.length === 0 ? (
        <div className="control-empty">Create a course first — lessons belong to a course.</div>
      ) : (
        <LessonCreateForm institutionId={id} courses={courses} />
      )}

      <section className="control-section">
        <h2>All lessons</h2>
        {lessons.length === 0 ? (
          <div className="control-empty">No lessons yet.</div>
        ) : (
          <div className="control-list">
            {lessons.map((l) => (
              <Link key={l.id} href={`/control/institutions/education/${id}/lessons/${l.id}`} className="control-list-row">
                <div className="control-list-row-title">{l.title}</div>
                <span className={`control-badge control-badge--${l.status === "published" ? "active" : l.status === "archived" ? "inactive" : "pending"}`}>{l.status}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
