"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CountrySelect } from "./CountrySelect";

type Step = "phone" | "code";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("CM");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, country }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || "Could not send a code to that number.");
        return;
      }
      setStep("code");
    } catch {
      setError("Something went wrong sending the code. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, country, code }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || "That code didn't work.");
        return;
      }
      // `next` can now be a fully-qualified cross-origin URL (e.g.
      // https://kistube.kingdomimpactventures.org/watch/123) since
      // KISTube split into its own subdomain and has no /login page of
      // its own - it sends users here with `next` pointing back at
      // itself. router.push() is for same-origin client-side navigation
      // only; an absolute URL to a different origin needs a real
      // navigation instead, or it silently does nothing useful.
      const isCrossOrigin = /^https?:\/\//i.test(next) && !next.startsWith(window.location.origin);
      if (isCrossOrigin) {
        window.location.href = next;
      } else {
        router.push(next);
        router.refresh();
      }
    } catch {
      setError("Something went wrong verifying that code. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (step === "code") {
    return (
      <form className="public-form" onSubmit={verifyCode} noValidate>
        <p className="form-note">We sent a code to {phone}. Enter it below to sign in with your KIS account.</p>
        <label htmlFor="login-code">
          Verification code
          <input
            id="login-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            aria-required="true"
            autoFocus
          />
        </label>
        <button className="button primary" type="submit" disabled={pending || !code}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <button
          type="button"
          className="button"
          onClick={() => { setStep("phone"); setCode(""); setError(""); }}
        >
          Use a different number
        </button>
        {error ? <div className="form-status" role="status" aria-live="polite">{error}</div> : null}
      </form>
    );
  }

  return (
    <form className="public-form" onSubmit={requestCode} noValidate>
      <p className="form-note">Sign in with the KIS account you already use in the app - no new account needed.</p>
      <label htmlFor="login-country">
        Country
        <CountrySelect id="login-country" value={country} onChange={setCountry} />
      </label>
      <label htmlFor="login-phone">
        Phone number
        <input
          id="login-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+237 6XX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          aria-required="true"
          autoFocus
        />
      </label>
      <button className="button primary" type="submit" disabled={pending || !phone}>
        {pending ? "Sending code…" : "Send code"}
      </button>
      {error ? <div className="form-status" role="status" aria-live="polite">{error}</div> : null}
      <p className="form-note">
        Have a pairing code from the app instead? <a href={`/pair?next=${encodeURIComponent(next)}`}>Use it here</a>.
      </p>
    </form>
  );
}
