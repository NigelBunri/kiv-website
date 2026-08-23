"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INSTITUTION_TYPES = [
  { value: "school", label: "School" },
  { value: "college", label: "College" },
  { value: "university", label: "University" },
  { value: "academy", label: "Academy" },
  { value: "training_center", label: "Training Center" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "community", label: "Community" },
  { value: "other", label: "Other" },
];

export default function EducationInstitutionCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [institutionType, setInstitutionType] = useState("academy");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/institutions/education`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, institution_type: institutionType }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create education institution.");
      const id = data.data?.institution?.id;
      if (id) {
        router.push(`/control/institutions/education/${id}`);
      } else {
        router.refresh();
      }
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create education institution." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Create an education institution</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riverside Academy" required />
        </label>
        <label>
          Institution type
          <select value={institutionType} onChange={(e) => setInstitutionType(e.target.value)}>
            {INSTITUTION_TYPES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !name.trim()}>
            {creating ? "Creating…" : "Create institution"}
          </button>
        </div>
      </form>
      {message ? <p className="control-error">{message.text}</p> : null}
    </section>
  );
}
