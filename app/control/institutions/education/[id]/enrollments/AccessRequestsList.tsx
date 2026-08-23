"use client";

import { useState } from "react";

type AccessRequest = {
  id: string;
  course_id: string;
  course_title: string;
  display_name?: string;
  phone?: string;
  status: string;
};

export default function AccessRequestsList({ initialRequests }: { initialRequests: AccessRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function decide(request: AccessRequest, action: "approve" | "reject") {
    setBusyId(request.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/courses/${request.course_id}/access-requests/${request.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to update this request.");
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to update this request." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="control-section">
      <h2>Pending course access requests</h2>
      {message ? <p className="control-error">{message.text}</p> : null}
      {requests.length === 0 ? (
        <div className="control-empty">No pending access requests.</div>
      ) : (
        <div className="control-list">
          {requests.map((request) => (
            <div key={request.id} className="control-list-row">
              <div>
                <div className="control-list-row-title">{request.display_name || request.phone || "Learner"}</div>
                <div className="control-list-row-meta">Requesting access to {request.course_title}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className="button primary" onClick={() => decide(request, "approve")} disabled={busyId === request.id}>Approve</button>
                <button type="button" className="button" onClick={() => decide(request, "reject")} disabled={busyId === request.id}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
