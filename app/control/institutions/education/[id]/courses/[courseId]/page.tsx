import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import CourseWorkspace from "./CourseWorkspace";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string; courseId: string }> }) {
  const { id, courseId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(
    `${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/courses/${encodeURIComponent(courseId)}/`,
    { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) },
  );
  if (!res.ok) notFound();
  const data = await res.json();

  return (
    <>
      <div className="control-header">
        <h1>{data?.course?.title || "Course"}</h1>
        <p>Manage this course&rsquo;s details, modules, lessons, and materials.</p>
      </div>
      <CourseWorkspace
        institutionId={id}
        courseId={courseId}
        initialCourse={data?.course}
        initialModules={data?.modules || []}
        initialLessons={data?.lessons || []}
        initialMaterials={data?.materials || []}
      />
    </>
  );
}
