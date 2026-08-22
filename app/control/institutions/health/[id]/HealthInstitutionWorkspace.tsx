"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INSTITUTION_TYPE_OPTIONS = [
  { value: "clinic", label: "Clinic" },
  { value: "hospital", label: "Hospital" },
  { value: "lab", label: "Laboratory" },
  { value: "diagnostics", label: "Diagnostics Center" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "wellness_center", label: "Wellness Center" },
];

type Institution = { id: string; name: string; institution_type: string; timezone: string; is_active: boolean };
type Service = { id: string; name: string; description?: string; is_active: boolean; base_cost_micro: number };

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}
async function patchJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

export default function HealthInstitutionWorkspace({ initialInstitution, initialServices }: { initialInstitution: Institution; initialServices: Service[] }) {
  const router = useRouter();
  const [institution, setInstitution] = useState(initialInstitution);
  const [services, setServices] = useState(initialServices);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [saving, setSaving] = useState(false);
  async function saveInstitution(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data = await patchJson(`/api/control/institutions/health/${institution.id}`, {
        name: institution.name,
        institution_type: institution.institution_type,
        timezone: institution.timezone,
        is_active: institution.is_active,
      });
      setInstitution(data.institution);
      setMessage({ kind: "success", text: "Institution updated." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save changes." });
    } finally {
      setSaving(false);
    }
  }

  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceCostKisc, setServiceCostKisc] = useState("");
  const [creatingService, setCreatingService] = useState(false);
  async function createService(event: React.FormEvent) {
    event.preventDefault();
    setCreatingService(true);
    setMessage(null);
    try {
      const data = await postJson(`/api/control/institutions/health/${institution.id}/services`, {
        name: serviceName,
        description: serviceDescription,
        base_cost_kisc: serviceCostKisc || undefined,
      });
      setServices((prev) => [...prev, data.service]);
      setServiceName(""); setServiceDescription(""); setServiceCostKisc("");
      setMessage({ kind: "success", text: "Service added." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add service." });
    } finally {
      setCreatingService(false);
    }
  }

  const [busyServiceId, setBusyServiceId] = useState<string | null>(null);
  async function toggleServiceActive(service: Service) {
    setBusyServiceId(service.id);
    try {
      const res = await fetch(`/api/control/institutions/health/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !service.is_active }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to update service.");
      setServices((prev) => prev.map((s) => (s.id === service.id ? data.data.service : s)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to update service." });
    } finally {
      setBusyServiceId(null);
    }
  }
  async function deleteService(serviceId: string) {
    if (!confirm("Delete this service?")) return;
    setBusyServiceId(serviceId);
    try {
      const res = await fetch(`/api/control/institutions/health/services/${serviceId}`, { method: "DELETE" });
      if (res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        if (!data.success) throw new Error(data.message || "Unable to delete service.");
      }
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete service." });
    } finally {
      setBusyServiceId(null);
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>Institution details</h2>
        <form className="control-form" onSubmit={saveInstitution}>
          <label>Name<input value={institution.name} onChange={(e) => setInstitution({ ...institution, name: e.target.value })} required /></label>
          <label>
            Type
            <select value={institution.institution_type} onChange={(e) => setInstitution({ ...institution, institution_type: e.target.value })}>
              {INSTITUTION_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <label>Timezone<input value={institution.timezone} onChange={(e) => setInstitution({ ...institution, timezone: e.target.value })} placeholder="Africa/Douala" /></label>
          <label>
            <input type="checkbox" checked={institution.is_active} onChange={(e) => setInstitution({ ...institution, is_active: e.target.checked })} /> Active
          </label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>Services</h2>
        <form className="control-form" onSubmit={createService}>
          <label>Name<input value={serviceName} onChange={(e) => setServiceName(e.target.value)} required /></label>
          <label>Description<textarea rows={2} value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} /></label>
          <label>Cost (KISC)<input type="number" min={0} step="0.01" value={serviceCostKisc} onChange={(e) => setServiceCostKisc(e.target.value)} /></label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={creatingService || !serviceName.trim()}>{creatingService ? "Adding…" : "Add service"}</button>
          </div>
        </form>
        {services.length === 0 ? (
          <div className="control-empty">No services yet.</div>
        ) : (
          <div className="control-list">
            {services.map((service) => (
              <div key={service.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{service.name}</div>
                  <div className="control-list-row-meta">{service.description}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className={`control-badge control-badge--${service.is_active ? "active" : "inactive"}`}>{service.is_active ? "active" : "inactive"}</span>
                  <button type="button" className="button" onClick={() => toggleServiceActive(service)} disabled={busyServiceId === service.id}>
                    {service.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button type="button" className="button" onClick={() => deleteService(service.id)} disabled={busyServiceId === service.id}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
