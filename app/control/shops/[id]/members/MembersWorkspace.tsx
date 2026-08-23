"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  user: string;
  user_details?: { id: string; display_name: string; phone?: string; email?: string };
  role: string;
  role_display: string;
  is_active: boolean;
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "member", label: "Member" },
];

export default function MembersWorkspace({ shopId, initialMembers }: { shopId: string; initialMembers: Member[] }) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupRole, setLookupRole] = useState("member");
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
      const res = await fetch(`/api/control/shops/${shopId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userId, role: lookupRole, is_active: true }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to add member.");
      setMembers((prev) => [...prev, data.data]);
      setLookupPhone(""); setLookupRole("member");
      setMessage({ kind: "success", text: "Member added." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add member." });
    } finally {
      setAdding(false);
    }
  }

  const [busyId, setBusyId] = useState<string | null>(null);
  async function updateRole(member: Member, role: string) {
    setBusyId(member.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/shops/${shopId}/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to update role.");
      setMembers((prev) => prev.map((m) => (m.id === member.id ? data.data : m)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to update role." });
    } finally {
      setBusyId(null);
    }
  }

  async function removeMember(member: Member) {
    if (!confirm(`Remove ${member.user_details?.display_name || "this member"} from the team?`)) return;
    setBusyId(member.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/shops/${shopId}/members/${member.id}`, { method: "DELETE" });
      if (res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        if (!data.success) throw new Error(data.message || "Unable to remove member.");
      }
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to remove member." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>Add team member</h2>
        <p>Look up an existing KIS user by phone number, then assign a role.</p>
        <form className="control-form" onSubmit={addMemberByPhone}>
          <label>Phone number<input value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} placeholder="+237…" required /></label>
          <label>
            Role
            <select value={lookupRole} onChange={(e) => setLookupRole(e.target.value)}>
              {ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={adding || !lookupPhone.trim()}>{adding ? "Adding…" : "Add member"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>Team</h2>
        {members.length === 0 ? (
          <div className="control-empty">No team members yet.</div>
        ) : (
          <div className="control-list">
            {members.map((member) => (
              <div key={member.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{member.user_details?.display_name || "Member"}</div>
                  <div className="control-list-row-meta">{member.user_details?.phone || member.user_details?.email}</div>
                </div>
                {member.role === "owner" ? (
                  <span className="control-badge control-badge--active">owner</span>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <select value={member.role} onChange={(e) => updateRole(member, e.target.value)} disabled={busyId === member.id}>
                      {ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <button type="button" className="button" onClick={() => removeMember(member)} disabled={busyId === member.id}>Remove</button>
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
