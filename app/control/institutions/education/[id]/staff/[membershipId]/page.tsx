import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import { BackLink } from "@/app/control/BackLink";

type Submission = {
  id: string;
  status: string;
  score_percent?: number;
  earned_points?: number;
  attempt_number: number;
  submitted_at?: string;
  graded_at?: string;
};

type Enrollment = { id: string; status: string; enrolled_at?: string; completed_at?: string };
type Booking = { id: string; status: string; booked_item_title?: string; amount_usd_label?: string };

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string; membershipId: string }> }) {
  const { id, membershipId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(
    `${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/memberships/${encodeURIComponent(membershipId)}/student-detail/`,
    { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) },
  );
  if (!res.ok) notFound();
  const data = await res.json();
  const membership = data?.membership || {};
  const metrics = data?.metrics || {};
  const enrollments: Enrollment[] = Array.isArray(data?.enrollments) ? data.enrollments : [];
  const bookings: Booking[] = Array.isArray(data?.bookings) ? data.bookings : [];
  const submissions: Submission[] = Array.isArray(data?.assessment_submissions) ? data.assessment_submissions : [];

  return (
    <>
      <BackLink href={`/control/institutions/education/${id}/staff`} label="Back to staff" />
      <div className="control-header">
        <h1>{membership.display_name || "Student"}</h1>
        <p>{membership.phone || membership.email}</p>
      </div>

      <section className="control-section">
        <h2>Overview</h2>
        <div className="control-stat-grid">
          <div className="control-stat-card"><span>Enrollments</span><strong>{metrics.enrollment_count ?? 0}</strong></div>
          <div className="control-stat-card"><span>Bookings</span><strong>{metrics.booking_count ?? 0}</strong></div>
          <div className="control-stat-card"><span>Assessments taken</span><strong>{metrics.assessment_submission_count ?? 0}</strong></div>
          <div className="control-stat-card"><span>Assessments graded</span><strong>{metrics.graded_assessment_count ?? 0}</strong></div>
        </div>
      </section>

      <section className="control-section">
        <h2>Assessment submissions</h2>
        {submissions.length === 0 ? (
          <div className="control-empty">No assessment submissions yet.</div>
        ) : (
          <div className="control-list">
            {submissions.map((s) => (
              <div key={s.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">Attempt {s.attempt_number}</div>
                  <div className="control-list-row-meta">
                    {s.status}{typeof s.score_percent === "number" ? ` · ${s.score_percent}%` : ""}{typeof s.earned_points === "number" ? ` · ${s.earned_points} pts` : ""}
                  </div>
                </div>
                <span className={`control-badge control-badge--${s.status === "graded" ? "active" : "pending"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="control-section">
        <h2>Enrollments</h2>
        {enrollments.length === 0 ? (
          <div className="control-empty">No enrollments yet.</div>
        ) : (
          <div className="control-list">
            {enrollments.map((e) => (
              <div key={e.id} className="control-list-row">
                <div className="control-list-row-title">{e.status}</div>
                <div className="control-list-row-meta">{e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : ""}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="control-section">
        <h2>Bookings</h2>
        {bookings.length === 0 ? (
          <div className="control-empty">No bookings yet.</div>
        ) : (
          <div className="control-list">
            {bookings.map((b) => (
              <div key={b.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{b.booked_item_title || "Booking"}</div>
                  <div className="control-list-row-meta">{b.amount_usd_label}</div>
                </div>
                <span className="control-badge control-badge--active">{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
