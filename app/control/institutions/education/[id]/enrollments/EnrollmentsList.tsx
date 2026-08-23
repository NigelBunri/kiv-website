"use client";

import { useState } from "react";

type Enrollment = { id: string; course_id?: string; user_id: string; status: string };

const ACTIONS = [
  { value: "enroll", label: "Enroll" },
  { value: "waitlist", label: "Waitlist" },
  { value: "cancel", label: "Cancel" },
  { value: "complete", label: "Mark complete" },
];

export default function EnrollmentsList({ institutionId, initialEnrollments }: { institutionId: string; initialEnrollments: Enrollment[] }) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function applyAction(enrollment: Enrollment, action: string) {
    setBusyId(enrollment.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/enrollments/${enrollment.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to update this enrollment.");
      setEnrollments((prev) => prev.map((e) => (e.id === enrollment.id ? { ...e, status: data.data?.status || e.status } : e)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to update this enrollment." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="control-section">
      <h2>Enrollments</h2>
      {message ? <p className="control-error">{message.text}</p> : null}
      {enrollments.length === 0 ? (
        <div className="control-empty">No enrollments yet.</div>
      ) : (
        <div className="control-list">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="control-list-row">
              <div>
                <div className="control-list-row-title">Learner {enrollment.user_id.slice(0, 8)}</div>
                <div className="control-list-row-meta">{enrollment.status}</div>
              </div>
              <select
                value=""
                onChange={(e) => { if (e.target.value) applyAction(enrollment, e.target.value); }}
                disabled={busyId === enrollment.id}
              >
                <option value="">Change status…</option>
                {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
