"use client";

import { useState } from "react";

export type StaffCase = {
  id: string;
  subject: {
    subject_id: string;
    display_name: string;
    country?: string;
  };
  level: string;
  status: string;
  provider: string;
  provider_status: string;
  evidence_summary: unknown;
  reviewer_notes: string;
  public_summary: Record<string, unknown>;
  submitted_at: string | null;
};

const BADGE_OPTIONS = [
  { code: "verified_partner", label: "Verified partner" },
  { code: "verified_organization", label: "Verified organization" },
  { code: "official_partner", label: "Official partner" },
];

function CaseRow({ item, onDecided }: { item: StaffCase; onDecided: (caseId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const [badgeCodes, setBadgeCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleBadge(code: string) {
    setBadgeCodes((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function decide(action: "approve" | "reject" | "needs_more_info") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/control/partners/${item.subject.subject_id}/verification-review/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: notes || undefined, badge_codes: action === "approve" ? badgeCodes : undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to submit review.");
      onDecided(item.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to submit review.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="control-list-row" style={{ flexDirection: "column", alignItems: "stretch", gap: ".5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="control-list-row-title">{item.subject.display_name || item.subject.subject_id}</div>
          <div className="control-list-row-meta">
            {item.level} · {item.provider || "manual"} · {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "—"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <span className="control-badge control-badge--pending">{item.status.replace(/_/g, " ")}</span>
          <button type="button" className="button" onClick={() => setExpanded((v) => !v)}>{expanded ? "Close" : "Review"}</button>
        </div>
      </div>

      {expanded ? (
        <div style={{ display: "grid", gap: ".6rem" }}>
          {item.evidence_summary ? (
            <pre style={{ background: "var(--cream-2)", padding: ".6rem", borderRadius: "8px", fontSize: ".75rem", overflowX: "auto" }}>
              {JSON.stringify(item.evidence_summary, null, 2)}
            </pre>
          ) : null}
          <label>
            Reviewer notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </label>
          <div>
            <span style={{ fontSize: ".82rem", fontWeight: 700 }}>Badges to issue (on approve)</span>
            <div className="control-actions" style={{ marginTop: ".3rem" }}>
              {BADGE_OPTIONS.map((badge) => (
                <label key={badge.code} style={{ display: "flex", alignItems: "center", gap: ".35rem", fontWeight: 400, fontSize: ".82rem" }}>
                  <input type="checkbox" checked={badgeCodes.includes(badge.code)} onChange={() => toggleBadge(badge.code)} />
                  {badge.label}
                </label>
              ))}
            </div>
          </div>
          <div className="control-actions">
            <button type="button" className="button primary" disabled={!!busy} onClick={() => decide("approve")}>
              {busy === "approve" ? "Approving…" : "Approve"}
            </button>
            <button type="button" className="button" disabled={!!busy} onClick={() => decide("needs_more_info")}>
              {busy === "needs_more_info" ? "Submitting…" : "Needs more info"}
            </button>
            <button type="button" className="button" disabled={!!busy} onClick={() => decide("reject")}>
              {busy === "reject" ? "Rejecting…" : "Reject"}
            </button>
          </div>
          {error ? <p className="control-error">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export default function VerificationQueueList({ initialCases }: { initialCases: StaffCase[] }) {
  const [cases, setCases] = useState(initialCases);

  function handleDecided(caseId: string) {
    setCases((prev) => prev.filter((c) => c.id !== caseId));
  }

  return (
    <section className="control-section">
      {cases.length === 0 ? (
        <div className="control-empty">No pending verification requests.</div>
      ) : (
        <div className="control-list">
          {cases.map((item) => (
            <CaseRow key={item.id} item={item} onDecided={handleDecided} />
          ))}
        </div>
      )}
    </section>
  );
}
