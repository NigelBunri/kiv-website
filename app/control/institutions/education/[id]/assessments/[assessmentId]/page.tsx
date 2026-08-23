import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import AssessmentWorkspace from "./AssessmentWorkspace";
import SubmissionsPanel from "./SubmissionsPanel";
import { BackLink } from "@/app/control/BackLink";

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string; assessmentId: string }> }) {
  const { id, assessmentId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(
    `${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/assessments/${encodeURIComponent(assessmentId)}/`,
    { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) },
  );
  if (!res.ok) notFound();
  const data = await res.json();

  return (
    <>
      <BackLink href={`/control/institutions/education/${id}/assessments`} label="Back to assessments" />
      <div className="control-header">
        <h1>{data?.assessment?.title || "Assessment"}</h1>
        <p>Manage this assessment&rsquo;s details, questions, and submissions.</p>
      </div>
      <AssessmentWorkspace institutionId={id} assessmentId={assessmentId} initialAssessment={data?.assessment} initialQuestions={data?.questions || []} />
      <SubmissionsPanel
        institutionId={id}
        assessmentId={assessmentId}
        questions={data?.questions || []}
        initialSubmissions={data?.submissions || []}
      />
    </>
  );
}
