"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIER_OPTIONS = ["Free", "Pro", "Business", "Business Pro", "Partner", "Partner Pro"];

export default function UserActions({ userId, status, tier }: { userId: string; status: string; tier: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [selectedTier, setSelectedTier] = useState(tier);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const isBanned = status === "banned" || status === "suspended";

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
        {isBanned ? (
          <button type="button" className="button primary" disabled={busy} onClick={() => runAction(`/api/control/admin/users/${userId}/unban`)}>
            Unban
          </button>
        ) : (
          <button type="button" className="button secondary" disabled={busy} onClick={() => runAction(`/api/control/admin/users/${userId}/ban`, { permanent: false })}>
            Suspend
          </button>
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
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
