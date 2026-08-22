"use client";

import { useState } from "react";

type Partner = { id: string; name: string; can_manage: boolean };

// Shared by the Shop, Health institution, and Education institution detail
// pages — all three now expose the identical POST/DELETE .../partner/
// connect-disconnect endpoint (this session's earlier backend work), so
// this one component drives all three instead of copy-pasting the same
// picker/button logic three times.
export default function PartnerConnectPanel({
  partnerApiPath,
  initialPartnerId,
  initialPartnerName,
  manageablePartners,
}: {
  partnerApiPath: string;
  initialPartnerId: string | null;
  initialPartnerName: string | null;
  manageablePartners: Partner[];
}) {
  const [busy, setBusy] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [partnerId, setPartnerId] = useState(initialPartnerId);
  const [partnerName, setPartnerName] = useState(initialPartnerName);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleConnect() {
    if (!selectedPartnerId) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(partnerApiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner_id: selectedPartnerId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to connect this partner.");
      const chosen = manageablePartners.find((partner) => partner.id === selectedPartnerId);
      setPartnerId(selectedPartnerId);
      setPartnerName(chosen?.name || "Partner");
      setMessage({ kind: "success", text: "Partner connected." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to connect this partner." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(partnerApiPath, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to disconnect this partner.");
      setPartnerId(null);
      setPartnerName(null);
      setMessage({ kind: "success", text: "Partner disconnected." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to disconnect this partner." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Partner organization</h2>
      <p>
        Attach this to a partner organization you manage — anyone with manager rights on that
        partner gets the same ability to manage it that you have.
      </p>
      <p><strong>{partnerName ? `Managed by: ${partnerName}` : "Not connected to a partner"}</strong></p>
      {partnerId ? (
        <div className="control-actions">
          <button type="button" className="button secondary" onClick={handleDisconnect} disabled={busy}>
            {busy ? "Disconnecting…" : "Disconnect partner"}
          </button>
        </div>
      ) : manageablePartners.length ? (
        <div className="control-actions">
          <select value={selectedPartnerId} onChange={(event) => setSelectedPartnerId(event.target.value)}>
            <option value="">Choose a partner…</option>
            {manageablePartners.map((partner) => (
              <option key={partner.id} value={partner.id}>{partner.name}</option>
            ))}
          </select>
          <button type="button" className="button primary" onClick={handleConnect} disabled={busy || !selectedPartnerId}>
            {busy ? "Connecting…" : "Connect partner"}
          </button>
        </div>
      ) : (
        <p className="control-note">You don&rsquo;t manage any partner organizations yet.</p>
      )}
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
