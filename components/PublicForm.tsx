"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { site } from "@/lib/site";

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

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";

declare global {
  interface Window {
    turnstile?: { reset: (widgetId?: string) => void };
  }
}

export function PublicForm({ kind, subject = "", product = "" }: PublicFormProps) {
  const id = useId();
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(false);

  // Loads Cloudflare's Turnstile script once per page, only when a site key
  // is actually configured — without one, the form renders and works exactly
  // as before (no CAPTCHA gate), matching this codebase's existing pattern
  // of degrading honestly when a provider isn't set up yet (see
  // validatePublicForm's KIV_FORM_PROVIDER messaging). Turnstile's own script
  // auto-discovers any `.cf-turnstile` div already in the DOM and injects a
  // hidden `cf-turnstile-response` input into its parent <form> itself, so
  // no manual wiring is needed to get the token into the submitted FormData.
  useEffect(() => {
    if (!site.turnstileSiteKey) return;
    if (document.getElementById(TURNSTILE_SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

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
      // Turnstile tokens are single-use — reset the widget after any
      // submission attempt (success or failure) so a resubmission (e.g.
      // after fixing a validation error) gets a fresh token instead of
      // silently failing verification with the already-spent one.
      window.turnstile?.reset();
    } catch {
      setResult({ ok: false, message: "The request could not be sent. Please try again or email the published contact address." });
    } finally {
      setPending(false);
    }
  }

  const errors = result?.fieldErrors ?? {};

  return (
    <form className="public-form" onSubmit={onSubmit} noValidate>
      {/* React 19 hoists <link> rendered anywhere in the tree up to <head> —
          this warms the connection to Turnstile's origin before its script
          tag is even injected, shaving the DNS/TLS handshake off the
          critical path for the widget that appears further down this form. */}
      {site.turnstileSiteKey ? <link rel="preconnect" href="https://challenges.cloudflare.com" /> : null}
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
      {site.turnstileSiteKey ? (
        <div className="cf-turnstile" data-sitekey={site.turnstileSiteKey} data-theme="light" />
      ) : null}
      <button className="button primary" type="submit" disabled={pending}>{pending ? "Sending..." : "Send request"}</button>
      <p className="form-note">By submitting, you agree to the privacy notice and email policy. Delivery depends on the configured server-side provider.</p>
      <div className={result?.ok ? "form-status success" : "form-status"} role="status" aria-live="polite">
        {result?.message}
      </div>
    </form>
  );
}
