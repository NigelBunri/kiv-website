"use client";

import { useState } from "react";

type Question = { id: string; prompt: string; question_type: string; points: number };
type ResponseRow = { id: string; question_id: string; answer_text?: string; is_correct?: boolean; earned_points?: number };
type Submission = {
  id: string;
  attempt_number: number;
  status: string;
  score_percent?: number;
  earned_points?: number;
  grader_feedback?: string;
  responses: ResponseRow[];
};

function GradingForm({
  institutionId,
  assessmentId,
  submission,
  questions,
  onGraded,
}: {
  institutionId: string;
  assessmentId: string;
  submission: Submission;
  questions: Question[];
  onGraded: (updated: Submission) => void;
}) {
  const [scores, setScores] = useState<Record<string, { earned_points: number; is_correct: boolean }>>(
    Object.fromEntries(submission.responses.map((r) => [r.id, { earned_points: r.earned_points || 0, is_correct: Boolean(r.is_correct) }])),
  );
  const [feedback, setFeedback] = useState(submission.grader_feedback || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function questionFor(response: ResponseRow): Question | undefined {
    return questions.find((q) => q.id === response.question_id);
  }

  async function submitGrade() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/assessments/${assessmentId}/submissions/${submission.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          grader_feedback: feedback,
          responses: submission.responses.map((r) => ({
            question_id: r.question_id,
            earned_points: scores[r.id]?.earned_points ?? 0,
            is_correct: scores[r.id]?.is_correct ?? false,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save grade.");
      onGraded(data.data.submission);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unable to save grade.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ paddingLeft: "1rem", paddingTop: "0.5rem" }}>
      {error ? <p className="control-error">{error}</p> : null}
      {submission.responses.map((response) => {
        const question = questionFor(response);
        return (
          <div key={response.id} style={{ marginBottom: "0.75rem" }}>
            <div><strong>{question?.prompt || "Question"}</strong></div>
            <div>{response.answer_text}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label>Points<input type="number" min={0} value={scores[response.id]?.earned_points ?? 0} onChange={(e) => setScores((prev) => ({ ...prev, [response.id]: { ...prev[response.id], earned_points: Number(e.target.value) } }))} style={{ width: "72px" }} /></label>
              <label><input type="checkbox" checked={scores[response.id]?.is_correct ?? false} onChange={(e) => setScores((prev) => ({ ...prev, [response.id]: { ...prev[response.id], is_correct: e.target.checked } }))} /> Correct</label>
            </div>
          </div>
        );
      })}
      <label>Overall feedback<textarea rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} /></label>
      <div className="control-actions">
        <button type="button" className="button primary" onClick={submitGrade} disabled={saving}>{saving ? "Saving…" : "Submit grade"}</button>
      </div>
    </div>
  );
}

export default function SubmissionsPanel({
  institutionId,
  assessmentId,
  questions,
  initialSubmissions,
}: {
  institutionId: string;
  assessmentId: string;
  questions: Question[];
  initialSubmissions: Submission[];
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [gradingId, setGradingId] = useState<string | null>(null);

  return (
    <section className="control-section">
      <h2>Submissions</h2>
      {submissions.length === 0 ? (
        <div className="control-empty">No submissions yet.</div>
      ) : (
        <div className="control-list">
          {submissions.map((submission) => (
            <div key={submission.id} className="control-list-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="control-list-row-title">Attempt {submission.attempt_number}</div>
                  <div className="control-list-row-meta">
                    {submission.status}{typeof submission.score_percent === "number" ? ` · ${submission.score_percent}%` : ""}
                  </div>
                </div>
                {submission.status === "submitted" ? (
                  <button type="button" className="button primary" onClick={() => setGradingId(gradingId === submission.id ? null : submission.id)}>
                    {gradingId === submission.id ? "Close" : "Grade"}
                  </button>
                ) : (
                  <span className={`control-badge control-badge--${submission.status === "graded" ? "active" : "pending"}`}>{submission.status}</span>
                )}
              </div>
              {gradingId === submission.id ? (
                <GradingForm
                  institutionId={institutionId}
                  assessmentId={assessmentId}
                  submission={submission}
                  questions={questions}
                  onGraded={(updated) => {
                    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
                    setGradingId(null);
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
