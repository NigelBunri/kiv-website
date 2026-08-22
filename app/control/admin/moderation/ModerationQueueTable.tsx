"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Flag = {
  id: string;
  target_type: string;
  target_id: string | null;
  severity: string;
  status: string;
  reason: string;
  created_at: string | null;
};

const ACTIONS = ["dismiss", "warn", "restrict", "suspend", "ban", "takedown"] as const;

export default function ModerationQueueTable({ flags }: { flags: Flag[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleAction(flagId: string, action: string) {
    setBusyId(flagId);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/admin/moderation/${flagId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Action failed.");
      setMessage({ kind: "success", text: `Flag ${action === "dismiss" ? "dismissed" : action + "ed"}.` });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Action failed." });
    } finally {
      setBusyId(null);
    }
  }

  if (flags.length === 0) {
    return <div className="control-empty">Nothing in the queue right now.</div>;
  }

  return (
    <>
      <table className="control-table">
        <thead>
          <tr>
            <th>Target</th>
            <th>Severity</th>
            <th>Reason</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((flag) => (
            <tr key={flag.id}>
              <td>{flag.target_type} {flag.target_id ? `#${flag.target_id.slice(0, 8)}` : ""}</td>
              <td><span className="control-badge control-badge--pending">{flag.severity}</span></td>
              <td>{flag.reason || "—"}</td>
              <td>
                <select
                  defaultValue=""
                  disabled={busyId === flag.id}
                  onChange={(event) => {
                    const action = event.target.value;
                    if (action) handleAction(flag.id, action);
                  }}
                >
                  <option value="" disabled>{busyId === flag.id ? "Working…" : "Choose action…"}</option>
                  {ACTIONS.map((action) => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </>
  );
}
