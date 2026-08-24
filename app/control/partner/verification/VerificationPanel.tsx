"use client";

import { useState } from "react";

type Badge = { code: string; label: string; level?: string };
type Case = {
  id: string;
  level: string;
  status: string;
  provider: string;
  provider_status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  public_summary: Record<string, unknown>;
} | null;

export type VerificationStatus = {
  verified: boolean;
  status?: string;
  level?: string;
  last_verified_at?: string | null;
  badges: Badge[];
  case: Case;
};

const CASE_ACTIVE_STATUSES = new Set(["draft", "submitted", "in_review", "needs_more_info"]);

export default function VerificationPanel({ partnerId, initialStatus }: { partnerId: string; initialStatus: VerificationStatus }) {
  const [verification, setVerification] = useState(initialStatus);
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const activeCase = verification.case && CASE_ACTIVE_STATUSES.has(verification.case.status) ? verification.case : null;

  async function handleStart(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/partners/${partnerId}/verification-start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider || undefined,
          evidence_metadata: notes ? { notes } : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to start verification.");
      setVerification((prev) => ({ ...prev, case: data.data.case, status: data.data.status?.status ?? prev.status }));
      setNotes("");
      setMessage({ kind: "success", text: "Verification request submitted." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to start verification." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Status</h2>
      <div className="control-stat-grid">
        <div className="control-stat-card">
          <span>Verified</span>
          <strong>{verification.verified ? "Yes" : "No"}</strong>
        </div>
        {verification.last_verified_at ? (
          <div className="control-stat-card">
            <span>Last verified</span>
            <strong>{new Date(verification.last_verified_at).toLocaleDateString()}</strong>
          </div>
        ) : null}
      </div>

      {verification.badges.length > 0 ? (
        <div className="control-actions">
          {verification.badges.map((badge) => (
            <span key={badge.code} className="control-badge control-badge--active">{badge.label}</span>
          ))}
        </div>
      ) : null}

      {activeCase ? (
        <div style={{ marginTop: "1.25rem" }}>
          <p>
            A verification request is <strong>{activeCase.status.replace(/_/g, " ")}</strong>
            {activeCase.submitted_at ? ` - submitted ${new Date(activeCase.submitted_at).toLocaleDateString()}` : ""}.
          </p>
          {typeof activeCase.public_summary?.message === "string" ? (
            <p className="control-note">{activeCase.public_summary.message as string}</p>
          ) : null}
        </div>
      ) : (
        <>
          <h3 style={{ marginTop: "1.5rem" }}>Request verification</h3>
          <form className="control-form" onSubmit={handleStart}>
            <label>
              Provider (optional)
              <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="">Manual review</option>
                <option value="dojah">Dojah</option>
                <option value="sumsub">Sumsub</option>
              </select>
            </label>
            <label>
              Notes for the reviewer (optional)
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2000} />
            </label>
            <p className="control-note">
              Supporting documents aren&rsquo;t uploadable here yet - reviewers will follow up if evidence is needed.
            </p>
            <div className="control-actions">
              <button type="submit" className="button primary" disabled={busy}>
                {busy ? "Submitting…" : "Request verification"}
              </button>
            </div>
          </form>
        </>
      )}
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
