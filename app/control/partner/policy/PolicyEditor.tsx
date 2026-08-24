"use client";

import { useState } from "react";

export type PartnerPolicySettings = {
  security: { require_mfa: boolean; session_timeout_minutes: number; allow_external_sharing: boolean };
  compliance: { audit_enabled: boolean; legal_hold_enabled: boolean };
  retention: { message_retention_days: number; file_retention_days: number };
  dlp: { enabled: boolean };
  data_residency: { region: string; allow_cross_region: boolean };
  automation: { webhooks_enabled: boolean };
  rate_limits: { messages_per_minute: number; uploads_per_hour: number };
  integrations: { sso_required: boolean; scim_enabled: boolean; api_access_enabled: boolean };
};

export default function PolicyEditor({ partnerId, initialSettings }: { partnerId: string; initialSettings: PartnerPolicySettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function setField<S extends keyof PartnerPolicySettings, K extends keyof PartnerPolicySettings[S]>(
    section: S,
    key: K,
    value: PartnerPolicySettings[S][K],
  ) {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/partners/${partnerId}/policy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // The backend's `settings` field is a single JSONField - sending a
        // partial section here would overwrite the whole object, so the
        // complete merged settings must go every time.
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save policy.");
      setMessage({ kind: "success", text: "Policy saved." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to save policy." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      <section className="control-section">
        <h2>Security</h2>
        <div className="control-form">
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input type="checkbox" checked={settings.security.require_mfa} onChange={(e) => setField("security", "require_mfa", e.target.checked)} />
            Require MFA for members
          </label>
          <label>
            Session timeout (minutes)
            <input type="number" min={5} value={settings.security.session_timeout_minutes} onChange={(e) => setField("security", "session_timeout_minutes", Number(e.target.value))} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input type="checkbox" checked={settings.security.allow_external_sharing} onChange={(e) => setField("security", "allow_external_sharing", e.target.checked)} />
            Allow external sharing
          </label>
        </div>
      </section>

      <section className="control-section">
        <h2>Compliance</h2>
        <div className="control-form">
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input type="checkbox" checked={settings.compliance.audit_enabled} onChange={(e) => setField("compliance", "audit_enabled", e.target.checked)} />
            Audit logging enabled
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input type="checkbox" checked={settings.compliance.legal_hold_enabled} onChange={(e) => setField("compliance", "legal_hold_enabled", e.target.checked)} />
            Legal hold enabled
          </label>
        </div>
      </section>

      <section className="control-section">
        <h2>Retention</h2>
        <div className="control-form">
          <label>
            Message retention (days)
            <input type="number" min={1} value={settings.retention.message_retention_days} onChange={(e) => setField("retention", "message_retention_days", Number(e.target.value))} />
          </label>
          <label>
            File retention (days)
            <input type="number" min={1} value={settings.retention.file_retention_days} onChange={(e) => setField("retention", "file_retention_days", Number(e.target.value))} />
          </label>
        </div>
      </section>

      <section className="control-section">
        <h2>Data loss prevention</h2>
        <div className="control-form">
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input type="checkbox" checked={settings.dlp.enabled} onChange={(e) => setField("dlp", "enabled", e.target.checked)} />
            DLP scanning enabled
          </label>
        </div>
      </section>

      <section className="control-section">
        <h2>Data residency</h2>
        <div className="control-form">
          <label>
            Region
            <select value={settings.data_residency.region} onChange={(e) => setField("data_residency", "region", e.target.value)}>
              <option value="auto">Auto</option>
              <option value="us">United States</option>
              <option value="eu">Europe</option>
              <option value="africa">Africa</option>
            </select>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input type="checkbox" checked={settings.data_residency.allow_cross_region} onChange={(e) => setField("data_residency", "allow_cross_region", e.target.checked)} />
            Allow cross-region data transfer
          </label>
        </div>
      </section>

      <section className="control-section">
        <h2>Automation</h2>
        <div className="control-form">
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input type="checkbox" checked={settings.automation.webhooks_enabled} onChange={(e) => setField("automation", "webhooks_enabled", e.target.checked)} />
            Webhooks enabled
          </label>
        </div>
      </section>

      <section className="control-section">
        <h2>Rate limits</h2>
        <div className="control-form">
          <label>
            Messages per minute
            <input type="number" min={1} value={settings.rate_limits.messages_per_minute} onChange={(e) => setField("rate_limits", "messages_per_minute", Number(e.target.value))} />
          </label>
          <label>
            Uploads per hour
            <input type="number" min={1} value={settings.rate_limits.uploads_per_hour} onChange={(e) => setField("rate_limits", "uploads_per_hour", Number(e.target.value))} />
          </label>
        </div>
      </section>

      <section className="control-section">
        <h2>Integrations</h2>
        <div className="control-form">
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input type="checkbox" checked={settings.integrations.sso_required} onChange={(e) => setField("integrations", "sso_required", e.target.checked)} />
            Require SSO
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input type="checkbox" checked={settings.integrations.scim_enabled} onChange={(e) => setField("integrations", "scim_enabled", e.target.checked)} />
            SCIM provisioning enabled
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input type="checkbox" checked={settings.integrations.api_access_enabled} onChange={(e) => setField("integrations", "api_access_enabled", e.target.checked)} />
            API access enabled
          </label>
        </div>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={busy}>{busy ? "Saving…" : "Save policy"}</button>
        </div>
        {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
      </section>
    </form>
  );
}
