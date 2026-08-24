"use client";

import { useState } from "react";

export type InviteEntry = {
  id: string;
  code: string;
  label: string;
  created_by_name: string | null;
  max_uses: number | null;
  use_count: number;
  expires_at: string | null;
  is_active: boolean;
  membership_role: string;
  is_expired: boolean;
  has_uses_remaining: boolean;
  is_redeemable: boolean;
  created_at: string;
};

async function apiCall(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

export default function InvitesManager({ partnerId, initialInvites }: { partnerId: string; initialInvites: InviteEntry[] }) {
  const [invites, setInvites] = useState(initialInvites);
  const [label, setLabel] = useState("");
  const [role, setRole] = useState("member");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const invite = await apiCall(`/api/control/partners/${partnerId}/invites`, "POST", {
        label: label || undefined,
        membership_role: role,
        max_uses: maxUses ? Number(maxUses) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      setInvites((prev) => [invite as InviteEntry, ...prev]);
      setLabel(""); setMaxUses(""); setExpiresAt("");
      setMessage({ kind: "success", text: "Invite created." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to create invite." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable(invite: InviteEntry) {
    if (!window.confirm("Disable this invite? It can no longer be redeemed.")) return;
    try {
      await apiCall(`/api/control/partners/${partnerId}/invites/${invite.id}`, "DELETE");
      setInvites((prev) => prev.map((i) => (i.id === invite.id ? { ...i, is_active: false, is_redeemable: false } : i)));
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to disable invite." });
    }
  }

  function copyCode(invite: InviteEntry) {
    // Invites are redeemed in the KIS app (Partners > join with code) - there's
    // no web redemption flow, so share the raw code rather than a link.
    navigator.clipboard?.writeText(invite.code).then(() => {
      setCopiedId(invite.id);
      setTimeout(() => setCopiedId((current) => (current === invite.id ? null : current)), 2000);
    });
  }

  return (
    <>
      <section className="control-section">
        <h2>Create invite</h2>
        <form className="control-form" onSubmit={handleCreate}>
          <label>Label (optional)<input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Youth team" /></label>
          <label>
            Role granted
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>Max uses (optional)<input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" /></label>
          <label>Expires (optional)<input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} /></label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={busy}>{busy ? "Creating…" : "Create invite"}</button>
          </div>
        </form>
        {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
      </section>

      <section className="control-section">
        <h2>Invites ({invites.length})</h2>
        {invites.length === 0 ? (
          <div className="control-empty">No invites created yet.</div>
        ) : (
          <table className="control-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Code</th>
                <th>Role</th>
                <th>Uses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td>{invite.label || <span className="control-note">-</span>}</td>
                  <td><code>{invite.code}</code></td>
                  <td>{invite.membership_role}</td>
                  <td>{invite.use_count}{invite.max_uses ? ` / ${invite.max_uses}` : ""}</td>
                  <td>
                    {!invite.is_active ? (
                      <span className="control-badge control-badge--inactive">disabled</span>
                    ) : invite.is_expired ? (
                      <span className="control-badge control-badge--inactive">expired</span>
                    ) : !invite.has_uses_remaining ? (
                      <span className="control-badge control-badge--pending">used up</span>
                    ) : (
                      <span className="control-badge control-badge--active">active</span>
                    )}
                  </td>
                  <td>
                    <div className="control-actions" style={{ marginTop: 0 }}>
                      <button type="button" className="button" onClick={() => copyCode(invite)}>
                        {copiedId === invite.id ? "Copied!" : "Copy code"}
                      </button>
                      {invite.is_active ? (
                        <button type="button" className="button" onClick={() => handleDisable(invite)}>Disable</button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
