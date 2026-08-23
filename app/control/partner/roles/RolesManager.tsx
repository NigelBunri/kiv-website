"use client";

import { useState } from "react";
import type { MemberEntry } from "../team/TeamRoster";

export type PartnerRole = {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  is_default: boolean;
};

export type PartnerRoleAssignment = {
  id: number;
  role: number;
  role_detail: PartnerRole;
  user: string;
};

// The full set of codenames apps/partners/views.py actually checks via
// _require_permission — there's no backend registry to read this from, so
// this list has to be kept in sync with those call sites by hand.
const PERMISSION_CODENAMES = [
  "partner.settings.view", "partner.settings.manage",
  "partner.roles.view", "partner.roles.manage",
  "partner.integrations.view", "partner.integrations.manage",
  "partner.automation.view", "partner.automation.manage",
  "partner.exports.view", "partner.exports.manage",
  "partner.access.view", "partner.access.manage",
  "partner.audit.view", "partner.policy.edit", "partner.reports.view",
];

async function apiCall(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

function memberLabel(member: MemberEntry) {
  return member.display_name || member.username || member.user_id;
}

export default function RolesManager({
  partnerId,
  initialRoles,
  initialAssignments,
  members,
}: {
  partnerId: string;
  initialRoles: PartnerRole[];
  initialAssignments: PartnerRoleAssignment[];
  members: MemberEntry[];
}) {
  const [roles, setRoles] = useState(initialRoles);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [assignRole, setAssignRole] = useState("");
  const [assignUser, setAssignUser] = useState("");

  function togglePermission(codename: string) {
    setPermissions((prev) => (prev.includes(codename) ? prev.filter((p) => p !== codename) : [...prev, codename]));
  }

  async function handleCreateRole(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const role = await apiCall(`/api/control/partners/${partnerId}/roles`, "POST", { name, description, permissions });
      setRoles((prev) => [...prev, role as PartnerRole]);
      setName(""); setDescription(""); setPermissions([]);
      setMessage({ kind: "success", text: "Role created." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to create role." });
    } finally {
      setBusy(false);
    }
  }

  async function handleAssign(event: React.FormEvent) {
    event.preventDefault();
    if (!assignRole || !assignUser) return;
    setBusy(true);
    setMessage(null);
    try {
      const assignment = await apiCall(`/api/control/partners/${partnerId}/role-assignments`, "POST", {
        role: Number(assignRole), user: assignUser,
      });
      setAssignments((prev) => [assignment as PartnerRoleAssignment, ...prev]);
      setMessage({ kind: "success", text: "Role assigned." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to assign role." });
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveAssignment(assignment: PartnerRoleAssignment) {
    if (!window.confirm("Remove this role assignment?")) return;
    setBusy(true);
    setMessage(null);
    try {
      await apiCall(`/api/control/partners/${partnerId}/role-assignments/remove`, "POST", { assignment_id: assignment.id });
      setAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to remove assignment." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="control-section">
        <h2>Roles ({roles.length})</h2>
        {roles.length === 0 ? (
          <div className="control-empty">No named roles created yet — team-level roles (member/manager/admin) still apply.</div>
        ) : (
          <table className="control-table">
            <thead><tr><th>Name</th><th>Permissions</th></tr></thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{role.name}</div>
                    {role.description ? <div style={{ fontSize: ".78rem", color: "var(--ink-faint)" }}>{role.description}</div> : null}
                  </td>
                  <td style={{ fontSize: ".82rem" }}>{role.permissions.length ? role.permissions.join(", ") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3 style={{ marginTop: "1.5rem" }}>Create a role</h3>
        <form className="control-form" onSubmit={handleCreateRole}>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Description (optional)<input value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          <fieldset style={{ border: "1px solid var(--line)", borderRadius: "8px", padding: ".75rem" }}>
            <legend style={{ fontSize: ".85rem", fontWeight: 700 }}>Permissions</legend>
            <div style={{ display: "grid", gap: ".35rem", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))" }}>
              {PERMISSION_CODENAMES.map((codename) => (
                <label key={codename} style={{ display: "flex", alignItems: "center", gap: ".4rem", fontWeight: 400, fontSize: ".82rem" }}>
                  <input type="checkbox" checked={permissions.includes(codename)} onChange={() => togglePermission(codename)} />
                  {codename}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={busy || !name}>{busy ? "Creating…" : "Create role"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>Role assignments ({assignments.length})</h2>
        {assignments.length === 0 ? (
          <div className="control-empty">No roles assigned yet.</div>
        ) : (
          <table className="control-table">
            <thead><tr><th>Member</th><th>Role</th><th></th></tr></thead>
            <tbody>
              {assignments.map((assignment) => {
                const member = members.find((m) => m.user_id === assignment.user);
                return (
                  <tr key={assignment.id}>
                    <td>{member ? memberLabel(member) : assignment.user}</td>
                    <td>{assignment.role_detail?.name || assignment.role}</td>
                    <td><button type="button" className="button" disabled={busy} onClick={() => handleRemoveAssignment(assignment)}>Remove</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {roles.length > 0 ? (
          <>
            <h3 style={{ marginTop: "1.5rem" }}>Assign a role</h3>
            <form className="control-form" onSubmit={handleAssign}>
              <label>
                Member
                <select value={assignUser} onChange={(e) => setAssignUser(e.target.value)} required>
                  <option value="">Select a member</option>
                  {members.map((m) => <option key={m.user_id} value={m.user_id}>{memberLabel(m)}</option>)}
                </select>
              </label>
              <label>
                Role
                <select value={assignRole} onChange={(e) => setAssignRole(e.target.value)} required>
                  <option value="">Select a role</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
              <div className="control-actions">
                <button type="submit" className="button primary" disabled={busy || !assignRole || !assignUser}>
                  {busy ? "Assigning…" : "Assign role"}
                </button>
              </div>
            </form>
          </>
        ) : null}
      </section>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </>
  );
}
