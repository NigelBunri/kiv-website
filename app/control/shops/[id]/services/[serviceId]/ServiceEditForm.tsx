"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

type ServiceFields = {
  name: string;
  category_ids: string[];
  short_summary: string;
  description: string;
  service_type: string;
  delivery_modes: string[];
  pricing_model: string;
  price: string;
  duration_minutes: number;
  remote_meeting_link: string;
  visibility: string;
  status: string;
};

const SERVICE_TYPE_OPTIONS = [
  { value: "appointment", label: "Appointment" },
  { value: "instant", label: "Instant" },
  { value: "scheduled", label: "Scheduled" },
  { value: "recurring", label: "Recurring" },
  { value: "emergency", label: "Emergency" },
];

const PRICING_MODEL_OPTIONS = [
  { value: "fixed", label: "Fixed" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "project", label: "Per project" },
  { value: "quote_only", label: "Quote only" },
  { value: "subscription", label: "Subscription" },
];

const DELIVERY_MODE_OPTIONS = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "instore", label: "In-store" },
  { value: "pickup_dropoff", label: "Pickup/Drop-off" },
];

export default function ServiceEditForm({
  shopId,
  serviceId,
  categories,
  initial,
}: {
  shopId: string;
  serviceId: string;
  categories: Category[];
  initial: ServiceFields;
}) {
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function toggleDeliveryMode(mode: string) {
    setFields((prev) => ({
      ...prev,
      delivery_modes: prev.delivery_modes.includes(mode) ? prev.delivery_modes.filter((m) => m !== mode) : [...prev.delivery_modes, mode],
    }));
  }

  function toggleCategory(id: string) {
    setFields((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id) ? prev.category_ids.filter((c) => c !== id) : [...prev.category_ids, id],
    }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/shops/${shopId}/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          category_ids: fields.category_ids,
          short_summary: fields.short_summary,
          description: fields.description,
          service_type: fields.service_type,
          delivery_modes: fields.delivery_modes,
          pricing_model: fields.pricing_model,
          price: fields.price,
          duration_minutes: fields.duration_minutes,
          remote_meeting_link: fields.delivery_modes.includes("remote") ? fields.remote_meeting_link : "",
          visibility: fields.visibility,
          status: fields.status,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save changes.");
      setMessage({ kind: "success", text: "Service saved." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save changes." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${fields.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/control/shops/${shopId}/services/${serviceId}`, { method: "DELETE" });
      if (res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        if (!data.success) throw new Error(data.message || "Unable to delete service.");
      }
      router.push(`/control/shops/${shopId}/services`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete service." });
      setDeleting(false);
    }
  }

  return (
    <section className="control-section">
      <form className="control-form" onSubmit={handleSave}>
        <label>Name<input value={fields.name} onChange={(e) => setFields({ ...fields, name: e.target.value })} required /></label>
        {categories.length > 0 ? (
          <fieldset>
            <legend>Categories (at least one required)</legend>
            {categories.map((c) => (
              <label key={c.id} style={{ display: "block" }}>
                <input type="checkbox" checked={fields.category_ids.includes(c.id)} onChange={() => toggleCategory(c.id)} /> {c.name}
              </label>
            ))}
          </fieldset>
        ) : null}
        <label>Short summary<input value={fields.short_summary} onChange={(e) => setFields({ ...fields, short_summary: e.target.value })} maxLength={320} /></label>
        <label>Description<textarea rows={3} value={fields.description} onChange={(e) => setFields({ ...fields, description: e.target.value })} /></label>
        <label>
          Service type
          <select value={fields.service_type} onChange={(e) => setFields({ ...fields, service_type: e.target.value })}>
            {SERVICE_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <fieldset>
          <legend>Delivery modes</legend>
          {DELIVERY_MODE_OPTIONS.map((opt) => (
            <label key={opt.value} style={{ display: "block" }}>
              <input type="checkbox" checked={fields.delivery_modes.includes(opt.value)} onChange={() => toggleDeliveryMode(opt.value)} /> {opt.label}
            </label>
          ))}
        </fieldset>
        {fields.delivery_modes.includes("remote") ? (
          <label>Remote meeting link<input type="url" value={fields.remote_meeting_link} onChange={(e) => setFields({ ...fields, remote_meeting_link: e.target.value })} placeholder="https://…" required /></label>
        ) : null}
        <label>
          Pricing model
          <select value={fields.pricing_model} onChange={(e) => setFields({ ...fields, pricing_model: e.target.value })}>
            {PRICING_MODEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label>Price<input type="number" min={0} step="0.01" value={fields.price} onChange={(e) => setFields({ ...fields, price: e.target.value })} required /></label>
        <label>Duration (minutes)<input type="number" min={1} value={fields.duration_minutes} onChange={(e) => setFields({ ...fields, duration_minutes: Number(e.target.value) })} required /></label>
        <label>
          Visibility
          <select value={fields.visibility} onChange={(e) => setFields({ ...fields, visibility: e.target.value })}>
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </label>
        <label>
          Status
          <select value={fields.status} onChange={(e) => setFields({ ...fields, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="paused">Paused</option>
          </select>
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          <button type="button" className="button" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete service"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
