"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RevealableMedia } from "../RevealableMedia";
import { ModerationActions, type ModerationInfo } from "../ModerationActions";

type MediaSafetyScanSummary = {
  id: string;
  status: string;
  reason: string;
  mime_type: string;
  score: number | null;
  context: string;
  has_media: boolean;
  target_type: string | null;
  target_id: string | null;
  moderatable: boolean;
  moderation: ModerationInfo;
};

type Flag = {
  id: string;
  target_type: string;
  target_id: string | null;
  severity: string;
  status: string;
  reason: string;
  created_at: string | null;
  media_safety_scan: MediaSafetyScanSummary | null;
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
            <th>Content</th>
            <th>Human moderation</th>
            <th>Flag action</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((flag) => (
            <tr key={flag.id}>
              <td>{flag.target_type} {flag.target_id ? `#${flag.target_id.slice(0, 8)}` : ""}</td>
              <td><span className="control-badge control-badge--pending">{flag.severity}</span></td>
              <td>
                {flag.reason || "-"}
                {flag.media_safety_scan ? (
                  <p className="control-note">
                    AI: {flag.media_safety_scan.status}
                    {flag.media_safety_scan.score != null ? ` (score ${flag.media_safety_scan.score.toFixed(2)})` : ""}
                  </p>
                ) : null}
              </td>
              <td>
                {flag.media_safety_scan?.has_media ? (
                  <RevealableMedia scanId={flag.media_safety_scan.id} mimeType={flag.media_safety_scan.mime_type} />
                ) : (
                  <span className="control-note">—</span>
                )}
              </td>
              <td>
                {flag.media_safety_scan?.moderatable && flag.media_safety_scan.target_type && flag.media_safety_scan.target_id ? (
                  <ModerationActions
                    targetType={flag.media_safety_scan.target_type}
                    targetId={flag.media_safety_scan.target_id}
                    moderation={flag.media_safety_scan.moderation}
                  />
                ) : (
                  <span className="control-note">—</span>
                )}
              </td>
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
