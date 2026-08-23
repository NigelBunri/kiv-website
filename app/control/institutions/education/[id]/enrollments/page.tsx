import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import AccessRequestsList from "./AccessRequestsList";
import EnrollmentsList from "./EnrollmentsList";

type AccessRequest = {
  id: string;
  course_id: string;
  course_title: string;
  display_name?: string;
  phone?: string;
  status: string;
};
type Enrollment = { id: string; course_id?: string; user_id: string; status: string };

export default async function EnrollmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const [requestsRes, enrollmentsRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/course-access-requests/`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    }),
    fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/enrollments/`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    }),
  ]);
  if (!requestsRes.ok) notFound();
  const requestsData = await requestsRes.json();
  const accessRequests: AccessRequest[] = Array.isArray(requestsData?.access_requests) ? requestsData.access_requests : [];
  const enrollmentsData = enrollmentsRes.ok ? await enrollmentsRes.json() : {};
  const enrollments: Enrollment[] = Array.isArray(enrollmentsData?.enrollments) ? enrollmentsData.enrollments : [];

  return (
    <>
      <div className="control-header">
        <h1>Enrollment requests</h1>
        <p>Approve or reject requests to join restricted courses, and manage existing enrollments.</p>
      </div>

      <AccessRequestsList initialRequests={accessRequests.filter((r) => r.status === "pending")} />
      <EnrollmentsList institutionId={id} initialEnrollments={enrollments} />
    </>
  );
}
