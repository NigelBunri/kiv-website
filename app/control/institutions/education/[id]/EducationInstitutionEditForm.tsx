"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INSTITUTION_TYPE_OPTIONS = [
  { value: "school", label: "School" },
  { value: "college", label: "College" },
  { value: "university", label: "University" },
  { value: "academy", label: "Academy" },
  { value: "training_center", label: "Training center" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "community", label: "Community" },
  { value: "other", label: "Other" },
];

const MEMBERSHIP_POLICY_OPTIONS = [
  { value: "open", label: "Open — anyone can join" },
  { value: "application", label: "Application required" },
  { value: "closed", label: "Closed — invite only" },
];

export default function EducationInstitutionEditForm({
  institutionId,
  initialName,
  initialDescription,
  initialInstitutionType,
  initialMembershipPolicy,
  initialContactEmail,
  initialContactPhone,
}: {
  institutionId: string;
  initialName: string;
  initialDescription: string;
  initialInstitutionType?: string;
  initialMembershipPolicy?: string;
  initialContactEmail?: string;
  initialContactPhone?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [institutionType, setInstitutionType] = useState(initialInstitutionType || "school");
  const [membershipPolicy, setMembershipPolicy] = useState(initialMembershipPolicy || "open");
  const [contactEmail, setContactEmail] = useState(initialContactEmail || "");
  const [contactPhone, setContactPhone] = useState(initialContactPhone || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/institutions/education/${institutionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          institution_type: institutionType,
          membership_policy: membershipPolicy,
          contact_email: contactEmail,
          contact_phone: contactPhone,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save changes.");
      setMessage({ kind: "success", text: "Changes saved." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save changes." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Institution details</h2>
      <form className="control-form" onSubmit={handleSave}>
        <label>
          Institution name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Description
          <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label>
          Institution type
          <select value={institutionType} onChange={(event) => setInstitutionType(event.target.value)}>
            {INSTITUTION_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label>
          Membership policy
          <select value={membershipPolicy} onChange={(event) => setMembershipPolicy(event.target.value)}>
            {MEMBERSHIP_POLICY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label>
          Contact email
          <input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="hello@example.com" />
        </label>
        <label>
          Contact phone
          <input type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="+1 555 000 0000" />
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
