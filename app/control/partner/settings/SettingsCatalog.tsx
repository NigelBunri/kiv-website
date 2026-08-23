"use client";

import { useState } from "react";

type Feature = {
  key: string;
  title: string;
  description: string;
  access: string[];
  enabled: boolean;
  allowed: boolean;
};

export type CatalogSection = {
  key: string;
  title: string;
  description: string;
  features: Feature[];
};

export default function SettingsCatalog({ partnerId, initialSections }: { partnerId: string; initialSections: CatalogSection[] }) {
  const [sections, setSections] = useState(initialSections);
  const [openSection, setOpenSection] = useState<string | null>(sections[0]?.key ?? null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function toggleFeature(sectionKey: string, feature: Feature) {
    const nextEnabled = !feature.enabled;
    setPendingKey(feature.key);
    setMessage(null);
    // optimistic update
    setSections((prev) =>
      prev.map((section) =>
        section.key !== sectionKey
          ? section
          : { ...section, features: section.features.map((f) => (f.key === feature.key ? { ...f, enabled: nextEnabled } : f)) },
      ),
    );
    try {
      const res = await fetch(`/api/control/partners/${partnerId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: [{ key: feature.key, enabled: nextEnabled }] }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to update this setting.");
    } catch (err: unknown) {
      // revert on failure
      setSections((prev) =>
        prev.map((section) =>
          section.key !== sectionKey
            ? section
            : { ...section, features: section.features.map((f) => (f.key === feature.key ? { ...f, enabled: feature.enabled } : f)) },
        ),
      );
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Unable to update this setting." });
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <section className="control-section">
      {message ? <p className="control-error">{message.text}</p> : null}
      <div style={{ display: "grid", gap: ".6rem" }}>
        {sections.map((section) => {
          const isOpen = openSection === section.key;
          return (
            <div key={section.key} style={{ border: "1px solid var(--line)", borderRadius: "10px", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : section.key)}
                style={{
                  width: "100%", textAlign: "left", padding: ".85rem 1rem", background: "var(--cream-2)",
                  border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span>
                  <strong>{section.title}</strong>
                  <span style={{ display: "block", fontSize: ".78rem", color: "var(--ink-faint)", fontWeight: 400 }}>{section.description}</span>
                </span>
                <span style={{ fontSize: ".78rem", color: "var(--ink-faint)" }}>
                  {section.features.filter((f) => f.enabled).length}/{section.features.length} on
                </span>
              </button>
              {isOpen ? (
                <div style={{ padding: "0 1rem" }}>
                  {section.features.map((feature) => (
                    <div
                      key={feature.key}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: ".7rem 0", borderBottom: "1px solid var(--line-soft)", gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{feature.title}</div>
                        <div style={{ fontSize: ".78rem", color: "var(--ink-faint)" }}>{feature.description}</div>
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: ".4rem", flexShrink: 0 }}>
                        <input
                          type="checkbox"
                          checked={feature.enabled}
                          disabled={!feature.allowed || pendingKey === feature.key}
                          onChange={() => toggleFeature(section.key, feature)}
                        />
                        {!feature.allowed ? <span className="control-note">not your role</span> : null}
                      </label>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
