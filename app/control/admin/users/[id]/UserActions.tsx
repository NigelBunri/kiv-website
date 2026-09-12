"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIER_OPTIONS = ["Free", "Pro", "Business", "Business Pro", "Partner", "Partner Pro"];

export default function UserActions({
  userId, status, tier, isActive, isDeleted,
}: {
  userId: string; status: string; tier: string; isActive: boolean; isDeleted: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [selectedTier, setSelectedTier] = useState(tier);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const isBanned = status === "banned" || status === "suspended";
  const isBlocked = status === "blocked";
  // Deletion doesn't change `status` (schedule_account_deletion only flips
  // is_active/is_deleted) — needs its own condition rather than folding
  // into isBanned/isBlocked, or a scheduled-for-deletion account would show
  // as if nothing were wrong with it.
  const needsRestore = isBanned || isBlocked || isDeleted || !isActive;

  async function runAction(path: string, body?: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Action failed.");
      setMessage({ kind: "success", text: "Done." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Action failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Actions</h2>
      <div className="control-actions">
        {needsRestore ? (
          <button
            type="button"
            className="button primary"
            disabled={busy}
            onClick={() => runAction(`/api/control/admin/users/${userId}/restore`)}
          >
            Restore
          </button>
        ) : (
          <>
            <button type="button" className="button secondary" disabled={busy} onClick={() => runAction(`/api/control/admin/users/${userId}/ban`, { permanent: false })}>
              Suspend
            </button>
            <button type="button" className="button secondary" disabled={busy} onClick={() => runAction(`/api/control/admin/users/${userId}/ban`, { permanent: true })}>
              Ban
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => {
                if (!window.confirm("Block this account? They will be signed out everywhere and unable to sign back in until restored.")) return;
                runAction(`/api/control/admin/users/${userId}/block`, { reason: "admin_console" });
              }}
            >
              Block
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => {
                if (!window.confirm("Delete this account? It will be deactivated immediately and permanently deleted after the grace period unless restored before then.")) return;
                runAction(`/api/control/admin/users/${userId}/delete`, { reason: "admin_console" });
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>
      <div className="control-actions" style={{ marginTop: "1rem" }}>
        <select value={selectedTier} onChange={(event) => setSelectedTier(event.target.value)}>
          {TIER_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <button
          type="button"
          className="button primary"
          disabled={busy || selectedTier === tier}
          onClick={() => runAction(`/api/control/admin/users/${userId}/set-tier`, { tier: selectedTier })}
        >
          Change tier
        </button>
      </div>
      <div className="control-actions" style={{ marginTop: "1rem" }}>
        <button
          type="button"
          className="button secondary"
          disabled={busy}
          onClick={() => {
            if (!window.confirm("Delete every registered device for this account? The user will be signed out everywhere and treated as logging in for the first time on their next login. This cannot be undone.")) return;
            runAction(`/api/control/admin/users/${userId}/wipe-devices`, { reason: "admin_console_reset" });
          }}
        >
          Reset devices
        </button>
      </div>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
