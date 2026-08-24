import Link from "next/link";
import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import AssessmentCreateForm from "./AssessmentCreateForm";
import { BackLink } from "@/app/control/BackLink";

type Assessment = { id: string; title: string; assessment_type: string; status: string };

export default async function AssessmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/assessments/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) notFound();
  const data = await res.json();
  const assessments: Assessment[] = Array.isArray(data?.assessments) ? data.assessments : [];

  return (
    <>
      <BackLink href={`/control/institutions/education/${id}`} label="Back to institution" />
      <div className="control-header">
        <h1>Assessments</h1>
        <p>Exams and quizzes - multiple choice, theory, or mixed.</p>
      </div>

      <AssessmentCreateForm institutionId={id} />

      <section className="control-section">
        <h2>All assessments</h2>
        {assessments.length === 0 ? (
          <div className="control-empty">No assessments yet.</div>
        ) : (
          <div className="control-list">
            {assessments.map((assessment) => (
              <Link key={assessment.id} href={`/control/institutions/education/${id}/assessments/${assessment.id}`} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{assessment.title}</div>
                  <div className="control-list-row-meta">{assessment.assessment_type}</div>
                </div>
                <span className={`control-badge control-badge--${assessment.status === "published" ? "active" : assessment.status === "archived" ? "inactive" : "pending"}`}>{assessment.status}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
