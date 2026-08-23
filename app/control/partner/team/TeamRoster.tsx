"use client";

import { useState } from "react";

export type MemberEntry = {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  membership_status: string;
  membership_role: string;
  role_names: string[];
  is_muted: boolean;
  is_banned: boolean;
  timed_out_until: string | null;
  joined_at: string | null;
};

const ROLE_OPTIONS = ["member", "manager", "admin"];

function initialsFor(name: string | null, username: string | null) {
  const source = (name || username || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

async function postJson(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

function MemberRow({
  member,
  partnerId,
  isOwner,
  isSelf,
  onUpdated,
}: {
  member: MemberEntry;
  partnerId: string;
  isOwner: boolean;
  isSelf: boolean;
  onUpdated: (next: MemberEntry) => void;
}) {
  const [role, setRole] = useState(member.membership_role);
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isTimedOut = Boolean(member.timed_out_until && new Date(member.timed_out_until).getTime() > Date.now());
  const locked = isOwner; // backend rejects role/moderation changes on the owner's own membership

  async function saveRole() {
    if (role === member.membership_role) return;
    setBusy("role");
    setError(null);
    try {
      const data = await postJson(`/api/control/partners/${partnerId}/members/${member.user_id}`, "PATCH", { role });
      if (data?.member) onUpdated(data.member as MemberEntry);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to change role.");
      setRole(member.membership_role);
    } finally {
      setBusy(null);
    }
  }

  async function moderate(action: string, options: { expires_at?: string } = {}) {
    setBusy(action);
    setError(null);
    try {
      await postJson(`/api/control/partners/${partnerId}/members/${member.user_id}/moderate`, "POST", {
        action,
        reason: reason || undefined,
        ...options,
      });
      const patch: Partial<MemberEntry> = {};
      if (action === "mute") patch.is_muted = true;
      if (action === "unmute") patch.is_muted = false;
      if (action === "ban") { patch.is_banned = true; patch.membership_status = "removed"; }
      if (action === "unban") { patch.is_banned = false; patch.membership_status = "subscriber"; }
      if (action === "kick") patch.membership_status = "removed";
      onUpdated({ ...member, ...patch });
      setReason("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Moderation action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <tr>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          {member.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.avatar_url} alt="" width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <span
              style={{
                width: 32, height: 32, borderRadius: "50%", background: "var(--gold-soft)", color: "var(--gold-strong)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", fontWeight: 700, flexShrink: 0,
              }}
            >
              {initialsFor(member.display_name, member.username)}
            </span>
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{member.display_name || member.username || member.user_id}{isSelf ? " (you)" : ""}</div>
            {member.username ? <div style={{ fontSize: ".78rem", color: "var(--ink-faint)" }}>@{member.username}</div> : null}
          </div>
        </div>
      </td>
      <td>
        {isOwner ? (
          <span className="control-badge control-badge--active">owner</span>
        ) : (
          <select value={role} onChange={(e) => setRole(e.target.value)} disabled={busy === "role"}>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
        {!isOwner && role !== member.membership_role ? (
          <button type="button" className="button" style={{ marginLeft: ".5rem" }} disabled={busy === "role"} onClick={saveRole}>
            {busy === "role" ? "Saving…" : "Save"}
          </button>
        ) : null}
      </td>
      <td>
        {member.membership_status === "removed" ? <span className="control-badge control-badge--inactive">removed</span> : null}
        {member.is_banned ? <span className="control-badge control-badge--inactive">banned</span> : null}
        {member.is_muted ? <span className="control-badge control-badge--pending">muted</span> : null}
        {isTimedOut ? <span className="control-badge control-badge--pending">timed out</span> : null}
        {!member.is_banned && !member.is_muted && !isTimedOut && member.membership_status !== "removed" ? (
          <span className="control-badge control-badge--active">active</span>
        ) : null}
      </td>
      <td>{member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "—"}</td>
      <td>
        {locked || isSelf ? (
          <span className="control-note">—</span>
        ) : (
          <>
            <button type="button" className="button" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Close" : "Moderate"}
            </button>
            {expanded ? (
              <div style={{ marginTop: ".6rem", display: "grid", gap: ".5rem" }}>
                <input
                  placeholder="Reason (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ maxWidth: "16rem" }}
                />
                <div className="control-actions" style={{ marginTop: 0 }}>
                  {member.is_muted ? (
                    <button type="button" className="button" disabled={!!busy} onClick={() => moderate("unmute")}>Unmute</button>
                  ) : (
                    <button type="button" className="button" disabled={!!busy} onClick={() => moderate("mute")}>Mute</button>
                  )}
                  <button
                    type="button"
                    className="button"
                    disabled={!!busy}
                    onClick={() => moderate("timeout", { expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString() })}
                  >
                    Timeout 24h
                  </button>
                  <button
                    type="button"
                    className="button"
                    disabled={!!busy}
                    onClick={() => { if (window.confirm("Remove this member from the organization?")) moderate("kick"); }}
                  >
                    Kick
                  </button>
                  {member.is_banned ? (
                    <button type="button" className="button" disabled={!!busy} onClick={() => moderate("unban")}>Unban</button>
                  ) : (
                    <button
                      type="button"
                      className="button"
                      disabled={!!busy}
                      onClick={() => { if (window.confirm("Ban this member? They will be removed and unable to rejoin.")) moderate("ban"); }}
                    >
                      Ban
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </>
        )}
        {error ? <p className="control-error">{error}</p> : null}
      </td>
    </tr>
  );
}

export default function TeamRoster({
  partnerId,
  initialMembers,
  viewerUserId,
  ownerId,
}: {
  partnerId: string;
  initialMembers: MemberEntry[];
  viewerUserId: string;
  ownerId: string;
}) {
  const [members, setMembers] = useState(initialMembers);

  function updateMember(next: MemberEntry) {
    setMembers((prev) => prev.map((m) => (m.user_id === next.user_id ? next : m)));
  }

  if (members.length === 0) {
    return <div className="control-empty">No members yet.</div>;
  }

  return (
    <section className="control-section">
      <h2>Members ({members.length})</h2>
      <table className="control-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Moderation</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <MemberRow
              key={member.user_id}
              member={member}
              partnerId={partnerId}
              isOwner={member.user_id === ownerId}
              isSelf={member.user_id === viewerUserId}
              onUpdated={updateMember}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}
