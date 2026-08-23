"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssessmentCreateForm({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [assessmentType, setAssessmentType] = useState("mcq");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [passingScorePercent, setPassingScorePercent] = useState("0");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          assessment_type: assessmentType,
          status: "draft",
          duration_minutes: Number(durationMinutes) || 0,
          max_attempts: Number(maxAttempts) || 1,
          passing_score_percent: Number(passingScorePercent) || 0,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create assessment.");
      const newId = data.data?.assessment?.id;
      setTitle(""); setAssessmentType("mcq"); setDurationMinutes("0"); setMaxAttempts("1"); setPassingScorePercent("0");
      setMessage({ kind: "success", text: "Assessment created." });
      router.refresh();
      if (newId) router.push(`/control/institutions/education/${institutionId}/assessments/${newId}`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create assessment." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>New assessment</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>
          Type
          <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)}>
            <option value="mcq">Multiple choice</option>
            <option value="theory">Theory / essay</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
        <label>Duration (minutes, 0 = untimed)<input type="number" min={0} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} /></label>
        <label>Max attempts<input type="number" min={1} value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} /></label>
        <label>Passing score (%)<input type="number" min={0} max={100} value={passingScorePercent} onChange={(e) => setPassingScorePercent(e.target.value)} /></label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !title.trim()}>{creating ? "Creating…" : "Create assessment"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
