"use client";

// The one interactive (client-rendered) section type — every other
// section in SectionRenderer.tsx stays a plain Server Component. Field
// names (title/submitLabel/fields[].key|label|type|required) match the RN
// Website Builder editor's own `form` section vocabulary exactly (see
// KIS/src/components/section-builder/types.ts's FormSectionData) — the RN
// app is the only place a `form` section is ever authored, so this reads
// its field names directly rather than inventing a second shape.
import { useRef, useState } from "react";

type FormField = { id?: string; key: string; label: string; type?: "text" | "email" | "textarea"; required?: boolean };

type Props = {
  data: Record<string, unknown>;
  sectionId: string;
  siteSlug: string;
  pageSlug: string;
};

export function PublicFormSection({ data, sectionId, siteSlug, pageSlug }: Props) {
  const title = typeof data.title === "string" ? data.title : "";
  const submitLabel = typeof data.submitLabel === "string" && data.submitLabel ? data.submitLabel : "Submit";
  const fields = Array.isArray(data.fields) ? (data.fields as FormField[]) : [];

  const mountedAt = useRef(Date.now());
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!fields.length) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, unknown> = {};
    for (const field of fields) payload[field.key] = String(formData.get(field.key) ?? "");
    payload["_hp"] = String(formData.get("_hp") ?? "");
    payload["_elapsed_ms"] = Date.now() - mountedAt.current;

    try {
      const response = await fetch(
        `/api/website-forms/${encodeURIComponent(siteSlug)}/${encodeURIComponent(pageSlug)}/${encodeURIComponent(sectionId)}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.success) {
        setStatus("error");
        setErrorMessage(result?.message || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Unable to submit right now. Please try again shortly.");
    }
  }

  return (
    <section className="wb-section wb-form">
      {title && <h2>{title}</h2>}
      <form className="public-form" onSubmit={handleSubmit}>
        <label className="honeypot" aria-hidden="true">
          Leave this field empty
          <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
        </label>
        {fields.map((field) => (
          <label key={field.key}>
            {field.label}{field.required && " *"}
            {field.type === "textarea" ? (
              <textarea name={field.key} required={field.required} rows={4} />
            ) : (
              <input type={field.type === "email" ? "email" : "text"} name={field.key} required={field.required} />
            )}
          </label>
        ))}
        <button type="submit" className="wb-button" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : submitLabel}
        </button>
        <p className={`form-status${status === "success" ? " success" : ""}`} role="status">
          {status === "success" && "Thanks — your message was sent."}
          {status === "error" && errorMessage}
        </p>
      </form>
    </section>
  );
}
