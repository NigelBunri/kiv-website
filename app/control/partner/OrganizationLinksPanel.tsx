"use client";

import { useState } from "react";

export type OrganizationLink = { id: string; owner_type: string; owner_id: string; name: string; exists: boolean };
type LinkableOrganization = { owner_type: string; owner_id: string; name: string };

const OWNER_TYPE_LABELS: Record<string, string> = {
  shop: "Shop",
  health_institution: "Health institution",
  education_institution: "Education institution",
  broadcast_channel: "Broadcast channel",
};

async function apiCall(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

export default function OrganizationLinksPanel({ partnerId, initialOrganizations }: { partnerId: string; initialOrganizations: OrganizationLink[] }) {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [linkable, setLinkable] = useState<LinkableOrganization[] | null>(null);
  const [selected, setSelected] = useState("");
  const [loadingLinkable, setLoadingLinkable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function loadLinkable() {
    setLoadingLinkable(true);
    setMessage(null);
    try {
      const data = await apiCall(`/api/control/partners/${partnerId}/organizations/linkable`, "GET");
      const options: LinkableOrganization[] = Array.isArray(data?.organizations) ? data.organizations : [];
      setLinkable(options);
      setSelected(options[0] ? `${options[0].owner_type}:${options[0].owner_id}` : "");
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to load organizations." });
    } finally {
      setLoadingLinkable(false);
    }
  }

  async function handleLink() {
    if (!selected) return;
    const [owner_type, owner_id] = selected.split(":");
    setBusy(true);
    setMessage(null);
    try {
      const link = await apiCall(`/api/control/partners/${partnerId}/organizations`, "POST", { owner_type, owner_id });
      setOrganizations((prev) => [link as OrganizationLink, ...prev]);
      setLinkable((prev) => (prev ? prev.filter((o) => !(o.owner_type === owner_type && o.owner_id === owner_id)) : prev));
      setMessage({ kind: "success", text: "Organization linked." });
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to link organization." });
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlink(link: OrganizationLink) {
    if (!window.confirm(`Unlink "${link.name}" from this partner organization?`)) return;
    setBusy(true);
    setMessage(null);
    try {
      await apiCall(`/api/control/partners/${partnerId}/organizations/unlink`, "POST", { link_id: link.id });
      setOrganizations((prev) => prev.filter((o) => o.id !== link.id));
    } catch (err: unknown) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to unlink organization." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Linked organizations</h2>
      <p>
        Shops, institutions, and channels you personally own that are linked to this partner
        profile. This is separate from delegated management — see each shop or institution&rsquo;s
        own page for that.
      </p>

      {organizations.length === 0 ? (
        <div className="control-empty">No organizations linked yet.</div>
      ) : (
        <table className="control-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((link) => (
              <tr key={link.id}>
                <td>{link.exists ? link.name : <em>No longer exists</em>}</td>
                <td>{OWNER_TYPE_LABELS[link.owner_type] || link.owner_type}</td>
                <td>
                  <button type="button" className="button" disabled={busy} onClick={() => handleUnlink(link)}>Unlink</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="control-actions">
        {linkable === null ? (
          <button type="button" className="button" disabled={loadingLinkable} onClick={loadLinkable}>
            {loadingLinkable ? "Loading…" : "Link an organization"}
          </button>
        ) : linkable.length === 0 ? (
          <p className="control-note">No unlinked organizations you own were found.</p>
        ) : (
          <>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {linkable.map((org) => (
                <option key={`${org.owner_type}:${org.owner_id}`} value={`${org.owner_type}:${org.owner_id}`}>
                  {org.name} ({OWNER_TYPE_LABELS[org.owner_type] || org.owner_type})
                </option>
              ))}
            </select>
            <button type="button" className="button primary" disabled={busy} onClick={handleLink}>
              {busy ? "Linking…" : "Link"}
            </button>
          </>
        )}
      </div>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
