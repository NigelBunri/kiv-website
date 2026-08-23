"use client";

import { useState } from "react";

export type OrganizationProfile = {
  display_name?: string;
  legal_name?: string;
  tagline?: string;
  mission?: string;
  vision?: string;
  website?: string;
  email?: string;
  phone?: string;
  industry?: string;
  size?: string;
  founded_year?: number | null;
  headquarters?: string;
  logo_url?: string;
};

export default function OrganizationProfileForm({ partnerId, initialProfile }: { partnerId: string; initialProfile: OrganizationProfile }) {
  const [fields, setFields] = useState<OrganizationProfile>(initialProfile);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function set<K extends keyof OrganizationProfile>(key: K, value: OrganizationProfile[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/partners/${partnerId}/organization-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          founded_year: fields.founded_year ? Number(fields.founded_year) : null,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save profile.");
      setFields(data.data);
      setMessage({ kind: "success", text: "Organization profile saved." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to save profile." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Profile details</h2>
      <form className="control-form" onSubmit={handleSubmit}>
        <label>Display name<input value={fields.display_name || ""} onChange={(e) => set("display_name", e.target.value)} required /></label>
        <label>Legal name<input value={fields.legal_name || ""} onChange={(e) => set("legal_name", e.target.value)} /></label>
        <label>Tagline<input value={fields.tagline || ""} onChange={(e) => set("tagline", e.target.value)} maxLength={255} /></label>
        <label>Mission<textarea value={fields.mission || ""} onChange={(e) => set("mission", e.target.value)} rows={3} /></label>
        <label>Vision<textarea value={fields.vision || ""} onChange={(e) => set("vision", e.target.value)} rows={3} /></label>
        <label>Website<input type="url" value={fields.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></label>
        <label>Contact email<input type="email" value={fields.email || ""} onChange={(e) => set("email", e.target.value)} /></label>
        <label>Contact phone<input value={fields.phone || ""} onChange={(e) => set("phone", e.target.value)} /></label>
        <label>Industry<input value={fields.industry || ""} onChange={(e) => set("industry", e.target.value)} /></label>
        <label>
          Organization size
          <select value={fields.size || ""} onChange={(e) => set("size", e.target.value)}>
            <option value="">Not specified</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </select>
        </label>
        <label>Founded year<input type="number" value={fields.founded_year ?? ""} onChange={(e) => set("founded_year", e.target.value ? Number(e.target.value) : null)} min={1800} max={2100} /></label>
        <label>Headquarters<input value={fields.headquarters || ""} onChange={(e) => set("headquarters", e.target.value)} placeholder="City, Country" /></label>
        <label>Logo URL<input type="url" value={fields.logo_url || ""} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://" /></label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
