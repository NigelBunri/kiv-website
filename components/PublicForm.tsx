"use client";

import { FormEvent, useId, useState } from "react";

type PublicFormProps = {
  kind: "contact" | "partner" | "investor" | "launch" | "deletion" | "security";
  subject?: string;
  product?: string;
};

type Result = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export function PublicForm({ kind, subject = "", product = "" }: PublicFormProps) {
  const id = useId();
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/forms", { method: "POST", body: formData });
      const data = (await response.json()) as Result;
      setResult(data);
      if (data.ok) form.reset();
    } catch {
      setResult({ ok: false, message: "The request could not be sent. Please try again or email the published contact address." });
    } finally {
      setPending(false);
    }
  }

  const errors = result?.fieldErrors ?? {};

  return (
    <form className="public-form" onSubmit={onSubmit} noValidate>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="product" value={product} />
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label>
        Name
        <input name="name" maxLength={120} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${id}-name-error` : undefined} required />
        {errors.name ? <span className="field-error" id={`${id}-name-error`}>{errors.name}</span> : null}
      </label>
      <label>
        Email
        <input name="email" type="email" maxLength={180} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${id}-email-error` : undefined} required />
        {errors.email ? <span className="field-error" id={`${id}-email-error`}>{errors.email}</span> : null}
      </label>
      <label>
        Organisation
        <input name="organisation" maxLength={160} />
      </label>
      <label>
        Subject
        <input name="subject" maxLength={180} defaultValue={subject} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? `${id}-subject-error` : undefined} required />
        {errors.subject ? <span className="field-error" id={`${id}-subject-error`}>{errors.subject}</span> : null}
      </label>
      <label>
        Message
        <textarea name="message" rows={7} maxLength={3000} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? `${id}-message-error` : undefined} required />
        {errors.message ? <span className="field-error" id={`${id}-message-error`}>{errors.message}</span> : null}
      </label>
      <label className="check-row">
        <input type="checkbox" name="consent" />
        <span>I understand KIV will use this information to respond to this request. I will not submit passwords or private credentials.</span>
      </label>
      {errors.consent ? <span className="field-error">{errors.consent}</span> : null}
      <button className="button primary" type="submit" disabled={pending}>{pending ? "Sending..." : "Send request"}</button>
      <p className="form-note">By submitting, you agree to the privacy notice and email policy. Delivery depends on the configured server-side provider.</p>
      <div className={result?.ok ? "form-status success" : "form-status"} role="status" aria-live="polite">
        {result?.message}
      </div>
    </form>
  );
}
