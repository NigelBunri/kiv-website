import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import LessonWorkspace from "./LessonWorkspace";

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const [lessonRes, coursesRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/lessons/${encodeURIComponent(lessonId)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/courses/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!lessonRes.ok) notFound();
  const data = await lessonRes.json();
  const coursesData = coursesRes.ok ? await coursesRes.json() : {};
  const courses = Array.isArray(coursesData?.courses) ? coursesData.courses : [];

  return (
    <>
      <div className="control-header">
        <h1>{data?.lesson?.title || "Lesson"}</h1>
        <p>Manage this lesson&rsquo;s content and settings.</p>
      </div>
      <LessonWorkspace institutionId={id} lessonId={lessonId} initialLesson={data?.lesson} courses={courses} />
    </>
  );
}
