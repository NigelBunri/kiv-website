"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ModerationInfo = {
  status: string;
  passed_at: string | null;
  expires_at: string | null;
  reviewed_by_id: string | null;
  is_broadcast_eligible: boolean;
} | null;

// The single human-approval action surface for public broadcast content —
// an AI-clean scan is never enough on its own (apps.broadcasts.
// moderation_gate on the backend); only an explicit, unexpired Pass here
// is. Shown wherever a scan/flag row is "moderatable" (currently
// target_type=broadcast_video only — see MODERATABLE_TARGET_TYPES).
export function ModerationActions({
  targetType,
  targetId,
  moderation,
}: {
  targetType: string;
  targetId: string;
  moderation: ModerationInfo;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(action: "pass" | "pending" | "block" | "delete") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/control/admin/media-safety/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, action }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Action failed.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  const status = moderation?.status || "pending_review";
  const eligible = moderation?.is_broadcast_eligible ?? false;

  return (
    <div className="moderation-actions">
      <div className="moderation-actions-status">
        <span className={`control-badge ${eligible ? "control-badge--active" : status === "blocked" || status === "deleted" ? "control-badge--inactive" : "control-badge--pending"}`}>
          {eligible ? "Broadcastable" : status.replace("_", " ")}
        </span>
        {moderation?.expires_at ? (
          <span className="control-note">
            {eligible ? "Re-check due" : "Expired"} {new Date(moderation.expires_at).toLocaleDateString()}
          </span>
        ) : null}
      </div>
      <div className="control-actions" style={{ marginTop: ".4rem" }}>
        <button type="button" className="button primary" disabled={busy} onClick={() => act("pass")}>Pass</button>
        <button type="button" className="button secondary" disabled={busy} onClick={() => act("pending")}>Pending</button>
        <button type="button" className="button secondary" disabled={busy} onClick={() => act("block")}>Block</button>
        <button type="button" className="button secondary" disabled={busy} onClick={() => act("delete")}>Delete</button>
      </div>
      {error ? <p className="control-error">{error}</p> : null}
    </div>
  );
}
