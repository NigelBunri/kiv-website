"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

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

export default function ServiceCreateForm({ shopId, categories }: { shopId: string; categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [shortSummary, setShortSummary] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("appointment");
  const [deliveryModes, setDeliveryModes] = useState<string[]>(["onsite"]);
  const [pricingModel, setPricingModel] = useState("fixed");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [remoteMeetingLink, setRemoteMeetingLink] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [status, setStatus] = useState("draft");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function toggleDeliveryMode(mode: string) {
    setDeliveryModes((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]));
  }

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/shops/${shopId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category_ids: categoryIds,
          short_summary: shortSummary,
          description,
          service_type: serviceType,
          delivery_modes: deliveryModes,
          pricing_model: pricingModel,
          price,
          duration_minutes: durationMinutes ? Number(durationMinutes) : undefined,
          remote_meeting_link: deliveryModes.includes("remote") ? remoteMeetingLink : "",
          visibility,
          status,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create service.");
      const newId = data.data?.id;
      setName(""); setCategoryIds([]); setShortSummary(""); setDescription(""); setPrice(""); setRemoteMeetingLink("");
      setMessage({ kind: "success", text: "Service created." });
      router.refresh();
      if (newId) router.push(`/control/shops/${shopId}/services/${newId}`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create service." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>New service</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        {categories.length > 0 ? (
          <fieldset>
            <legend>Categories (at least one required)</legend>
            {categories.map((c) => (
              <label key={c.id} style={{ display: "block" }}>
                <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} /> {c.name}
              </label>
            ))}
          </fieldset>
        ) : (
          <p className="control-error">No service categories are configured yet — contact an admin.</p>
        )}
        <label>Short summary<input value={shortSummary} onChange={(e) => setShortSummary(e.target.value)} maxLength={320} /></label>
        <label>Description<textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label>
          Service type
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
            {SERVICE_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <fieldset>
          <legend>Delivery modes</legend>
          {DELIVERY_MODE_OPTIONS.map((opt) => (
            <label key={opt.value} style={{ display: "block" }}>
              <input type="checkbox" checked={deliveryModes.includes(opt.value)} onChange={() => toggleDeliveryMode(opt.value)} /> {opt.label}
            </label>
          ))}
        </fieldset>
        {deliveryModes.includes("remote") ? (
          <label>Remote meeting link<input type="url" value={remoteMeetingLink} onChange={(e) => setRemoteMeetingLink(e.target.value)} placeholder="https://…" required /></label>
        ) : null}
        <label>
          Pricing model
          <select value={pricingModel} onChange={(e) => setPricingModel(e.target.value)}>
            {PRICING_MODEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label>Price<input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required /></label>
        <label>Duration (minutes)<input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} required /></label>
        <label>
          Visibility
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="paused">Paused</option>
          </select>
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !name.trim() || !price || categoryIds.length === 0}>
            {creating ? "Creating…" : "Create service"}
          </button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
