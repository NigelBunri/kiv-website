"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; option_text: string; is_correct: boolean; option_order: number };
type Question = { id: string; prompt: string; question_type: string; points: number; is_required: boolean; question_order: number; options: Option[] };
type Assessment = {
  id: string;
  title: string;
  summary?: string;
  instructions?: string;
  assessment_type: string;
  status: string;
  duration_minutes: number;
  max_attempts: number;
  passing_score_percent: number;
  starts_at?: string;
  ends_at?: string;
};

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function patchJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}
async function postJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}
async function del(url: string) {
  const res = await fetch(url, { method: "DELETE" });
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.message || "Request failed.");
}

function QuestionEditor({
  institutionId,
  assessmentId,
  question,
  showOptions,
  onChanged,
  onRemoved,
}: {
  institutionId: string;
  assessmentId: string;
  question: Question;
  showOptions: boolean;
  onChanged: (q: Question) => void;
  onRemoved: () => void;
}) {
  const base = `/api/control/education/institutions/${institutionId}/assessments/${assessmentId}/questions/${question.id}`;
  const [prompt, setPrompt] = useState(question.prompt);
  const [points, setPoints] = useState(question.points);
  const [isRequired, setIsRequired] = useState(question.is_required);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const updated = await patchJson(base, { prompt, points, is_required: isRequired });
      onChanged({ ...question, ...updated.question });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unable to save question.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Remove this question?")) return;
    setSaving(true);
    try {
      await del(base);
      onRemoved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unable to remove question.");
      setSaving(false);
    }
  }

  const [newOptionText, setNewOptionText] = useState("");
  async function addOption(event: React.FormEvent) {
    event.preventDefault();
    if (!newOptionText.trim()) return;
    try {
      const data = await postJson(`${base}/options`, { option_text: newOptionText, is_correct: false });
      onChanged({ ...question, options: [...question.options, data.option] });
      setNewOptionText("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unable to add option.");
    }
  }

  async function toggleOptionCorrect(option: Option) {
    try {
      const data = await patchJson(`${base}/options/${option.id}`, { is_correct: !option.is_correct });
      onChanged({ ...question, options: question.options.map((o) => (o.id === option.id ? data.option : o)) });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unable to update option.");
    }
  }

  async function removeOption(option: Option) {
    try {
      await del(`${base}/options/${option.id}`);
      onChanged({ ...question, options: question.options.filter((o) => o.id !== option.id) });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unable to remove option.");
    }
  }

  return (
    <div className="control-list-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.5rem" }}>
      {error ? <p className="control-error">{error}</p> : null}
      <div className="control-form" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.5rem", alignItems: "flex-end" }}>
        <label style={{ flex: 2 }}>Prompt<input value={prompt} onChange={(e) => setPrompt(e.target.value)} /></label>
        <label style={{ width: "90px" }}>Points<input type="number" min={0} value={points} onChange={(e) => setPoints(Number(e.target.value))} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} /> Required
        </label>
        <button type="button" className="button" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        <button type="button" className="button" onClick={remove} disabled={saving}>Remove question</button>
      </div>
      {showOptions ? (
        <div style={{ paddingLeft: "1rem" }}>
          {question.options.map((option) => (
            <div key={option.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <input type="checkbox" checked={option.is_correct} onChange={() => toggleOptionCorrect(option)} /> Correct
              </label>
              <span>{option.option_text}</span>
              <button type="button" className="button" onClick={() => removeOption(option)}>Remove</button>
            </div>
          ))}
          <form onSubmit={addOption} style={{ display: "flex", gap: "0.5rem" }}>
            <input value={newOptionText} onChange={(e) => setNewOptionText(e.target.value)} placeholder="New option text" />
            <button type="submit" className="button">Add option</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export default function AssessmentWorkspace({
  institutionId,
  assessmentId,
  initialAssessment,
  initialQuestions,
}: {
  institutionId: string;
  assessmentId: string;
  initialAssessment: Assessment;
  initialQuestions: Question[];
}) {
  const router = useRouter();
  const base = `/api/control/education/institutions/${institutionId}/assessments/${assessmentId}`;
  const [assessment, setAssessment] = useState(initialAssessment);
  const [startsAt, setStartsAt] = useState(toLocalInput(initialAssessment.starts_at));
  const [endsAt, setEndsAt] = useState(toLocalInput(initialAssessment.ends_at));
  const [questions, setQuestions] = useState(initialQuestions);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [saving, setSaving] = useState(false);
  async function saveAssessment(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data = await patchJson(base, {
        title: assessment.title,
        summary: assessment.summary,
        instructions: assessment.instructions,
        assessment_type: assessment.assessment_type,
        status: assessment.status,
        duration_minutes: assessment.duration_minutes,
        max_attempts: assessment.max_attempts,
        passing_score_percent: assessment.passing_score_percent,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      });
      setAssessment(data.assessment);
      setMessage({ kind: "success", text: "Assessment saved." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save assessment." });
    } finally {
      setSaving(false);
    }
  }

  const [deleting, setDeleting] = useState(false);
  async function deleteAssessment() {
    if (!confirm(`Delete "${assessment.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await del(base);
      router.push(`/control/institutions/education/${institutionId}/assessments`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete assessment." });
      setDeleting(false);
    }
  }

  const [newQuestionPrompt, setNewQuestionPrompt] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("mcq");
  const [addingQuestion, setAddingQuestion] = useState(false);
  async function addQuestion(event: React.FormEvent) {
    event.preventDefault();
    if (!newQuestionPrompt.trim()) return;
    setAddingQuestion(true);
    setMessage(null);
    try {
      const data = await postJson(`${base}/questions`, {
        prompt: newQuestionPrompt,
        question_type: newQuestionType,
        points: 1,
        is_required: true,
        question_order: questions.length,
      });
      setQuestions((prev) => [...prev, { ...data.question, options: [] }]);
      setNewQuestionPrompt("");
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add question." });
    } finally {
      setAddingQuestion(false);
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>Assessment details</h2>
        <form className="control-form" onSubmit={saveAssessment}>
          <label>Title<input value={assessment.title} onChange={(e) => setAssessment({ ...assessment, title: e.target.value })} required /></label>
          <label>Summary<textarea rows={2} value={assessment.summary || ""} onChange={(e) => setAssessment({ ...assessment, summary: e.target.value })} /></label>
          <label>Instructions<textarea rows={3} value={assessment.instructions || ""} onChange={(e) => setAssessment({ ...assessment, instructions: e.target.value })} /></label>
          <label>
            Type
            <select value={assessment.assessment_type} onChange={(e) => setAssessment({ ...assessment, assessment_type: e.target.value })}>
              <option value="mcq">Multiple choice</option>
              <option value="theory">Theory / essay</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label>
            Status
            <select value={assessment.status} onChange={(e) => setAssessment({ ...assessment, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>Starts at<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></label>
          <label>Ends at<input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></label>
          <label>Duration (minutes, 0 = untimed)<input type="number" min={0} value={assessment.duration_minutes} onChange={(e) => setAssessment({ ...assessment, duration_minutes: Number(e.target.value) })} /></label>
          <label>Max attempts<input type="number" min={1} value={assessment.max_attempts} onChange={(e) => setAssessment({ ...assessment, max_attempts: Number(e.target.value) })} /></label>
          <label>Passing score (%)<input type="number" min={0} max={100} value={assessment.passing_score_percent} onChange={(e) => setAssessment({ ...assessment, passing_score_percent: Number(e.target.value) })} /></label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            <button type="button" className="button" onClick={deleteAssessment} disabled={deleting}>{deleting ? "Deleting…" : "Delete assessment"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>Questions</h2>
        {questions.length === 0 ? (
          <div className="control-empty">No questions yet.</div>
        ) : (
          <div className="control-list">
            {questions.map((question) => (
              <QuestionEditor
                key={question.id}
                institutionId={institutionId}
                assessmentId={assessmentId}
                question={question}
                showOptions={question.question_type === "mcq" || question.question_type === "true_false"}
                onChanged={(updated) => setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))}
                onRemoved={() => setQuestions((prev) => prev.filter((q) => q.id !== question.id))}
              />
            ))}
          </div>
        )}
        <form className="control-form" onSubmit={addQuestion} style={{ marginTop: "1rem" }}>
          <label>New question prompt<input value={newQuestionPrompt} onChange={(e) => setNewQuestionPrompt(e.target.value)} /></label>
          <label>
            Question type
            <select value={newQuestionType} onChange={(e) => setNewQuestionType(e.target.value)}>
              <option value="mcq">Multiple choice</option>
              <option value="true_false">True / false</option>
              <option value="short_answer">Short answer</option>
              <option value="essay">Essay</option>
            </select>
          </label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={addingQuestion || !newQuestionPrompt.trim()}>{addingQuestion ? "Adding…" : "Add question"}</button>
          </div>
        </form>
      </section>
    </>
  );
}
