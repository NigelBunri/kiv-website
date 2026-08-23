"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  userId?: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
};

type Institution = {
  id: string;
  name?: string;
  type?: string;
  owner_contact?: { userId?: string; name?: string; phone?: string; email?: string };
  members?: Member[];
  membership_settings?: { open?: boolean; discountPercent?: number };
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "analyst", label: "Analyst" },
  { value: "member", label: "Member" },
  { value: "unassigned", label: "Unassigned" },
];

export default function StaffWorkspace({
  institutionId,
  initialTarget,
  otherInstitutions,
}: {
  institutionId: string;
  initialTarget: Institution;
  otherInstitutions: Institution[];
}) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>((initialTarget.members || []).filter((m) => m.role !== "owner"));
  const [membershipOpen, setMembershipOpen] = useState(Boolean(initialTarget.membership_settings?.open));
  const [membershipDiscount, setMembershipDiscount] = useState(initialTarget.membership_settings?.discountPercent ?? 10);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const ownerName = initialTarget.owner_contact?.name || "Owner";

  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupName, setLookupName] = useState("");
  const [lookupRole, setLookupRole] = useState("staff");
  const [looking, setLooking] = useState(false);
  async function addMemberByPhone(event: React.FormEvent) {
    event.preventDefault();
    setLooking(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/contacts/check?phone=${encodeURIComponent(lookupPhone)}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Lookup failed.");
      const found = data.data;
      const userId = found?.userId ?? found?.user_id;
      if (!found?.registered || !userId) {
        throw new Error("No KIS account found for that phone number.");
      }
      if (members.some((m) => String(m.userId) === String(userId))) {
        throw new Error("This person is already staff at this institution.");
      }
      setMembers((prev) => [
        ...prev,
        { id: `member-${userId}`, userId: String(userId), name: lookupName || "New staff member", phone: lookupPhone, role: lookupRole },
      ]);
      setLookupPhone(""); setLookupName(""); setLookupRole("staff");
      setMessage({ kind: "success", text: "Added — remember to save changes below." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add member." });
    } finally {
      setLooking(false);
    }
  }

  function updateRole(id: string, role: string) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }
  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  const [saving, setSaving] = useState(false);
  async function saveAll() {
    setSaving(true);
    setMessage(null);
    try {
      const updatedTarget: Institution = {
        ...initialTarget,
        id: institutionId,
        members,
        membership_settings: { open: membershipOpen, discountPercent: membershipDiscount },
      };
      const res = await fetch(`/api/control/health-profile/manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_type: "health_profile",
          updates: { institutions: [...otherInstitutions, updatedTarget] },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save staff changes.");
      setMessage({ kind: "success", text: "Staff and settings saved." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save staff changes." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>Membership settings</h2>
        <div className="control-form">
          <label>
            <input type="checkbox" checked={membershipOpen} onChange={(e) => setMembershipOpen(e.target.checked)} /> Open membership (anyone can request to join)
          </label>
          <label>
            Member discount (%)
            <input type="number" min={10} max={100} value={membershipDiscount} onChange={(e) => setMembershipDiscount(Number(e.target.value))} />
          </label>
        </div>
      </section>

      <section className="control-section">
        <h2>Add staff</h2>
        <p>Look up an existing KIS user by phone number, then assign a role.</p>
        <form className="control-form" onSubmit={addMemberByPhone}>
          <label>Phone number<input value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} placeholder="+237…" required /></label>
          <label>Display name<input value={lookupName} onChange={(e) => setLookupName(e.target.value)} /></label>
          <label>
            Role
            <select value={lookupRole} onChange={(e) => setLookupRole(e.target.value)}>
              {ROLE_OPTIONS.filter((opt) => opt.value !== "unassigned").map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={looking || !lookupPhone.trim()}>{looking ? "Looking up…" : "Add staff member"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>Staff</h2>
        <div className="control-list">
          <div className="control-list-row">
            <div>
              <div className="control-list-row-title">{ownerName}</div>
              <div className="control-list-row-meta">Owner — cannot be changed</div>
            </div>
            <span className="control-badge control-badge--active">owner</span>
          </div>
          {members.length === 0 ? (
            <div className="control-empty">No other staff yet.</div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{member.name}</div>
                  <div className="control-list-row-meta">{member.phone || member.email || member.userId}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <select value={member.role} onChange={(e) => updateRole(member.id, e.target.value)}>
                    {ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button type="button" className="button" onClick={() => removeMember(member.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="control-actions">
          <button type="button" className="button primary" onClick={saveAll} disabled={saving}>{saving ? "Saving…" : "Save staff & settings"}</button>
        </div>
      </section>
    </>
  );
}
