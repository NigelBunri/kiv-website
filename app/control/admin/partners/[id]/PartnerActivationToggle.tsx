"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PartnerActivationToggle({ partnerId, isActive }: { partnerId: string; isActive: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleToggle() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/admin/partners/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
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
        <button type="button" className={isActive ? "button secondary" : "button primary"} disabled={busy} onClick={handleToggle}>
          {busy ? "Working…" : isActive ? "Deactivate partner" : "Reactivate partner"}
        </button>
      </div>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
