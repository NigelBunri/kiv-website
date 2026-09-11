"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CONFIRM_PHRASE = "WIPE ALL DEVICES";

export default function WipeAllDevicesButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function runWipe() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/control/admin/devices/wipe-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: CONFIRM_PHRASE, reason: "admin_console_platform_wide_reset" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Action failed.");
      const { users_affected, devices_deleted } = data.data || {};
      setMessage({ kind: "success", text: `Done — ${devices_deleted ?? 0} devices deleted across ${users_affected ?? 0} accounts.` });
      setOpen(false);
      setTyped("");
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Action failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Danger zone</h2>
      <p>
        Deletes every registered device for every account platform-wide. Every user is signed out
        everywhere and their next login registers a fresh device with no secondary/pairing-code
        prompt. Accounts themselves are kept. This cannot be undone.
      </p>
      {!open ? (
        <button type="button" className="button secondary" onClick={() => setOpen(true)}>
          Force re-login for all users&hellip;
        </button>
      ) : (
        <div className="control-actions" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
          <label htmlFor="wipe-confirm">
            Type <strong>{CONFIRM_PHRASE}</strong> to confirm:
          </label>
          <input
            id="wipe-confirm"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
          />
          <div className="control-actions">
            <button
              type="button"
              className="button primary"
              disabled={busy || typed !== CONFIRM_PHRASE}
              onClick={runWipe}
            >
              {busy ? "Wiping…" : "Wipe every account's devices"}
            </button>
            <button type="button" className="button secondary" disabled={busy} onClick={() => { setOpen(false); setTyped(""); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
