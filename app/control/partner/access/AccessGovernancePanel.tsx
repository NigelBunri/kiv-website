"use client";

import { useState } from "react";
import type { MemberEntry } from "../team/TeamRoster";
import type { PartnerRole } from "../roles/RolesManager";

export type AccessRequestEntry = {
  id: number;
  requester: string;
  requester_name: string | null;
  target_user: string | null;
  target_name: string | null;
  requested_role: number | null;
  justification: string;
  status: string;
  created_at: string;
};

export type AccessReviewEntry = {
  id: number;
  name: string;
  findings: string;
  status: string;
  created_at: string;
  closed_at: string | null;
};

async function apiCall(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

function memberLabel(members: MemberEntry[], userId: string | null) {
  if (!userId) return "-";
  const member = members.find((m) => m.user_id === userId);
  return member?.display_name || member?.username || userId;
}

export default function AccessGovernancePanel({
  partnerId,
  initialRequests,
  initialReviews,
  members,
  roles,
}: {
  partnerId: string;
  initialRequests: AccessRequestEntry[];
  initialReviews: AccessReviewEntry[];
  members: MemberEntry[];
  roles: PartnerRole[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [reviews, setReviews] = useState(initialReviews);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [targetUser, setTargetUser] = useState("");
  const [requestedRole, setRequestedRole] = useState("");
  const [justification, setJustification] = useState("");

  const [reviewName, setReviewName] = useState("");

  async function handleCreateRequest(event: React.FormEvent) {
    event.preventDefault();
    if (!targetUser || !requestedRole) return;
    setBusy(true);
    setMessage(null);
    try {
      const created = await apiCall(`/api/control/partners/${partnerId}/access-requests`, "POST", {
        target_user: targetUser, requested_role: Number(requestedRole), justification,
      });
      setRequests((prev) => [created as AccessRequestEntry, ...prev]);
      setTargetUser(""); setRequestedRole(""); setJustification("");
      setMessage({ kind: "success", text: "Access request submitted." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to submit access request." });
    } finally {
      setBusy(false);
    }
  }

  async function decide(request: AccessRequestEntry, action: "approve" | "reject") {
    setBusy(true);
    setMessage(null);
    try {
      const updated = await apiCall(`/api/control/partners/${partnerId}/access-requests/${request.id}/${action}`, "POST");
      setRequests((prev) => prev.map((r) => (r.id === request.id ? (updated as AccessRequestEntry) : r)));
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to submit decision." });
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateReview(event: React.FormEvent) {
    event.preventDefault();
    if (!reviewName) return;
    setBusy(true);
    setMessage(null);
    try {
      const created = await apiCall(`/api/control/partners/${partnerId}/access-reviews`, "POST", { name: reviewName });
      setReviews((prev) => [created as AccessReviewEntry, ...prev]);
      setReviewName("");
      setMessage({ kind: "success", text: "Access review opened." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to open access review." });
    } finally {
      setBusy(false);
    }
  }

  async function closeReview(review: AccessReviewEntry, findings: string) {
    setBusy(true);
    setMessage(null);
    try {
      const updated = await apiCall(`/api/control/partners/${partnerId}/access-reviews/${review.id}/close`, "POST", { findings });
      setReviews((prev) => prev.map((r) => (r.id === review.id ? (updated as AccessReviewEntry) : r)));
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to close access review." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>Access requests ({requests.length})</h2>
        {requests.length === 0 ? (
          <div className="control-empty">No access requests yet.</div>
        ) : (
          <table className="control-table">
            <thead><tr><th>For</th><th>Role</th><th>Justification</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {requests.map((r) => {
                const role = roles.find((role) => role.id === r.requested_role);
                return (
                  <tr key={r.id}>
                    <td>{memberLabel(members, r.target_user)}</td>
                    <td>{role?.name || r.requested_role}</td>
                    <td style={{ maxWidth: "16rem" }}>{r.justification || "-"}</td>
                    <td><span className="control-badge control-badge--pending">{r.status}</span></td>
                    <td>
                      {r.status === "pending" ? (
                        <div className="control-actions" style={{ marginTop: 0 }}>
                          <button type="button" className="button primary" disabled={busy} onClick={() => decide(r, "approve")}>Approve</button>
                          <button type="button" className="button" disabled={busy} onClick={() => decide(r, "reject")}>Reject</button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <h3 style={{ marginTop: "1.5rem" }}>Request access for a member</h3>
        <form className="control-form" onSubmit={handleCreateRequest}>
          <label>
            Member
            <select value={targetUser} onChange={(e) => setTargetUser(e.target.value)} required>
              <option value="">Select a member</option>
              {members.map((m) => <option key={m.user_id} value={m.user_id}>{m.display_name || m.username || m.user_id}</option>)}
            </select>
          </label>
          <label>
            Role requested
            <select value={requestedRole} onChange={(e) => setRequestedRole(e.target.value)} required>
              <option value="">Select a role</option>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </label>
          <label>Justification (optional)<textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows={2} /></label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={busy || !targetUser || !requestedRole}>
              {busy ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </form>
        {roles.length === 0 ? <p className="control-note">Create a named role first, under Roles &amp; permissions.</p> : null}
      </section>

      <section className="control-section">
        <h2>Access reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="control-empty">No access reviews yet.</div>
        ) : (
          <div className="control-list">
            {reviews.map((review) => (
              <ReviewRow key={review.id} review={review} busy={busy} onClose={closeReview} />
            ))}
          </div>
        )}

        <h3 style={{ marginTop: "1.5rem" }}>Open a new access review</h3>
        <form className="control-form" onSubmit={handleCreateReview}>
          <label>Name<input value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="e.g. Q1 2026 access review" required /></label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={busy || !reviewName}>{busy ? "Opening…" : "Open review"}</button>
          </div>
        </form>
      </section>
    </>
  );
}

function ReviewRow({ review, busy, onClose }: { review: AccessReviewEntry; busy: boolean; onClose: (review: AccessReviewEntry, findings: string) => void }) {
  const [findings, setFindings] = useState(review.findings || "");
  const isOpen = review.status !== "closed";

  return (
    <div className="control-list-row" style={{ flexDirection: "column", alignItems: "stretch", gap: ".4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="control-list-row-title">{review.name}</div>
          <div className="control-list-row-meta">Opened {new Date(review.created_at).toLocaleDateString()}</div>
        </div>
        <span className={`control-badge control-badge--${isOpen ? "pending" : "active"}`}>{review.status}</span>
      </div>
      {isOpen ? (
        <>
          <textarea value={findings} onChange={(e) => setFindings(e.target.value)} rows={2} placeholder="Findings (optional)" />
          <div className="control-actions" style={{ marginTop: 0 }}>
            <button type="button" className="button primary" disabled={busy} onClick={() => onClose(review, findings)}>Close review</button>
          </div>
        </>
      ) : review.findings ? (
        <p className="control-note">{review.findings}</p>
      ) : null}
    </div>
  );
}
