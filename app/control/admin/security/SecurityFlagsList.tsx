"use client";

import { useState } from "react";

type Flag = {
  id: string;
  actor?: string | null;
  reason: string;
  path?: string;
  severity: string;
  resolved: boolean;
  created_at: string;
};

export default function SecurityFlagsList({ initialFlags }: { initialFlags: Flag[] }) {
  const [flags, setFlags] = useState(initialFlags);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function resolveFlag(flag: Flag) {
    setBusyId(flag.id);
    setMessage(null);
    try {
      const res = await fetch("/api/control/admin/security-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: flag.id, resolved: true }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to resolve this flag.");
      setFlags((prev) => prev.filter((f) => f.id !== flag.id));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to resolve this flag." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="control-section">
      {message ? <p className="control-error">{message.text}</p> : null}
      {flags.length === 0 ? (
        <div className="control-empty">No unresolved flags — all clear.</div>
      ) : (
        <div className="control-list">
          {flags.map((flag) => (
            <div key={flag.id} className="control-list-row">
              <div>
                <div className="control-list-row-title">{flag.reason}</div>
                <div className="control-list-row-meta">
                  {flag.path ? `${flag.path} · ` : ""}{new Date(flag.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className={`control-badge control-badge--${flag.severity === "critical" ? "inactive" : "pending"}`}>{flag.severity}</span>
                <button type="button" className="button" onClick={() => resolveFlag(flag)} disabled={busyId === flag.id}>
                  {busyId === flag.id ? "Resolving…" : "Resolve"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
