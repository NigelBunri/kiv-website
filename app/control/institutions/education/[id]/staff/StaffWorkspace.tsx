"use client";

import { useState } from "react";
import Link from "next/link";

type Membership = {
  id: string;
  user_id: string;
  display_name?: string;
  phone?: string;
  email?: string;
  role: string;
  status: string;
  title?: string;
};

const ROLE_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "administrator", label: "Administrator" },
  { value: "lecturer", label: "Lecturer" },
  { value: "academic_staff", label: "Academic staff" },
  { value: "student", label: "Student" },
];

export default function StaffWorkspace({ institutionId, initialMemberships }: { institutionId: string; initialMemberships: Membership[] }) {
  const [memberships, setMemberships] = useState<Membership[]>(initialMemberships);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupTitle, setLookupTitle] = useState("");
  const [lookupRole, setLookupRole] = useState("academic_staff");
  const [adding, setAdding] = useState(false);
  async function addMemberByPhone(event: React.FormEvent) {
    event.preventDefault();
    setAdding(true);
    setMessage(null);
    try {
      const lookupRes = await fetch(`/api/control/contacts/check?phone=${encodeURIComponent(lookupPhone)}`);
      const lookupData = await lookupRes.json();
      if (!lookupData.success) throw new Error(lookupData.message || "Lookup failed.");
      const found = lookupData.data;
      const userId = found?.userId ?? found?.user_id;
      if (!found?.registered || !userId) {
        throw new Error("No KIS account found for that phone number.");
      }
      const res = await fetch(`/api/control/education/institutions/${institutionId}/memberships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: lookupRole, status: "active", title: lookupTitle }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to add staff member.");
      const membership: Membership = data.data?.membership;
      setMemberships((prev) => [...prev.filter((m) => m.id !== membership.id), membership]);
      setLookupPhone(""); setLookupTitle(""); setLookupRole("academic_staff");
      setMessage({ kind: "success", text: "Staff member added." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add staff member." });
    } finally {
      setAdding(false);
    }
  }

  const [busyId, setBusyId] = useState<string | null>(null);
  async function changeRole(membership: Membership, role: string) {
    setBusyId(membership.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/memberships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: membership.user_id, role, status: membership.status, title: membership.title }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to update role.");
      const updated: Membership = data.data?.membership;
      setMemberships((prev) => prev.map((m) => (m.id === membership.id ? updated : m)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to update role." });
    } finally {
      setBusyId(null);
    }
  }

  async function applyAction(membership: Membership, action: "approve" | "reject" | "remove") {
    setBusyId(membership.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/memberships/${membership.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to update this member.");
      const status = data.data?.status || data.data?.membership?.status;
      setMemberships((prev) => prev.map((m) => (m.id === membership.id ? { ...m, status: status || m.status } : m)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to update this member." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>Add staff</h2>
        <p>Look up an existing KIS user by phone number, then assign a role.</p>
        <form className="control-form" onSubmit={addMemberByPhone}>
          <label>Phone number<input value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} placeholder="+237…" required /></label>
          <label>Title (optional)<input value={lookupTitle} onChange={(e) => setLookupTitle(e.target.value)} placeholder="Dean of Sciences" /></label>
          <label>
            Role
            <select value={lookupRole} onChange={(e) => setLookupRole(e.target.value)}>
              {ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={adding || !lookupPhone.trim()}>{adding ? "Adding…" : "Add staff member"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>Members</h2>
        {memberships.length === 0 ? (
          <div className="control-empty">No members yet.</div>
        ) : (
          <div className="control-list">
            {memberships.map((member) => (
              <div key={member.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">
                    {member.role === "student" && member.status === "active" ? (
                      <Link href={`/control/institutions/education/${institutionId}/staff/${member.id}`}>{member.display_name || member.phone || member.email || "Member"}</Link>
                    ) : (
                      member.display_name || member.phone || member.email || "Member"
                    )}
                  </div>
                  <div className="control-list-row-meta">{member.title ? `${member.title} · ` : ""}{member.role} · {member.status}</div>
                </div>
                {member.role === "owner" ? (
                  <span className="control-badge control-badge--active">owner</span>
                ) : member.status === "pending" || member.status === "invited" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button type="button" className="button primary" onClick={() => applyAction(member, "approve")} disabled={busyId === member.id}>Approve</button>
                    <button type="button" className="button" onClick={() => applyAction(member, "reject")} disabled={busyId === member.id}>Reject</button>
                  </div>
                ) : member.status === "removed" || member.status === "rejected" ? (
                  <span className="control-badge control-badge--inactive">{member.status}</span>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <select value={member.role} onChange={(e) => changeRole(member, e.target.value)} disabled={busyId === member.id}>
                      {ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <button type="button" className="button" onClick={() => applyAction(member, "remove")} disabled={busyId === member.id}>Remove</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
