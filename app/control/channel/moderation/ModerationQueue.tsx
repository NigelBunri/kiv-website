"use client";

import { useState } from "react";

type ModerationRecord = {
  id: string;
  target_type: string;
  reason?: string;
  status: string;
  action: string;
  content_title?: string;
  comment_body?: string;
  reporter_display?: string;
  created_at: string;
};

const ACTIONS = [
  { value: "keep", label: "Keep (dismiss report)" },
  { value: "hide", label: "Hide" },
  { value: "remove", label: "Remove" },
  { value: "restrict_comments", label: "Restrict comments on this channel" },
];

export default function ModerationQueue({ initialRecords }: { initialRecords: ModerationRecord[] }) {
  const [records, setRecords] = useState(initialRecords);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function applyAction(record: ModerationRecord, action: string) {
    setBusyId(record.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/channel-moderation/${record.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to act on this report.");
      const updated = data.data;
      setRecords((prev) => prev.map((r) => (r.id === record.id ? { ...r, status: updated?.status || r.status, action: updated?.action || r.action } : r)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to act on this report." });
    } finally {
      setBusyId(null);
    }
  }

  const openRecords = records.filter((r) => r.status === "open" || r.status === "reviewing");
  const resolvedRecords = records.filter((r) => r.status === "actioned" || r.status === "dismissed");

  return (
    <>
      {message ? <p className="control-error">{message.text}</p> : null}

      <section className="control-section">
        <h2>Open reports</h2>
        {openRecords.length === 0 ? (
          <div className="control-empty">No open reports.</div>
        ) : (
          <div className="control-list">
            {openRecords.map((record) => (
              <div key={record.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{record.content_title || record.comment_body || `${record.target_type} report`}</div>
                  <div className="control-list-row-meta">{record.reason}{record.reporter_display ? ` · reported by ${record.reporter_display}` : ""}</div>
                </div>
                <select
                  value=""
                  onChange={(e) => { if (e.target.value) applyAction(record, e.target.value); }}
                  disabled={busyId === record.id}
                >
                  <option value="">Take action…</option>
                  {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="control-section">
        <h2>Resolved</h2>
        {resolvedRecords.length === 0 ? (
          <div className="control-empty">Nothing resolved yet.</div>
        ) : (
          <div className="control-list">
            {resolvedRecords.map((record) => (
              <div key={record.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{record.content_title || record.comment_body || `${record.target_type} report`}</div>
                  <div className="control-list-row-meta">{record.reason}</div>
                </div>
                <span className="control-badge control-badge--inactive">{record.status} · {record.action}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
