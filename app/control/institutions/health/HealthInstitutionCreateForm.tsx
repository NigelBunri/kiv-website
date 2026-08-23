"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INSTITUTION_TYPES = [
  { value: "clinic", label: "Clinic" },
  { value: "hospital", label: "Hospital" },
  { value: "lab", label: "Laboratory" },
  { value: "diagnostics", label: "Diagnostics Center" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "wellness_center", label: "Wellness Center" },
];

export default function HealthInstitutionCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [institutionType, setInstitutionType] = useState("clinic");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/institutions/health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, institution_type: institutionType }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create health institution.");
      const id = data.data?.institution?.id;
      if (id) {
        router.push(`/control/institutions/health/${id}`);
      } else {
        router.refresh();
      }
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create health institution." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Create a health institution</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riverside Clinic" required />
        </label>
        <label>
          Institution type
          <select value={institutionType} onChange={(e) => setInstitutionType(e.target.value)}>
            {INSTITUTION_TYPES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
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
