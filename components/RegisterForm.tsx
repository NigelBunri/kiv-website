"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CountrySelect } from "./CountrySelect";
import { findCountry } from "@/lib/countries";

// Same fields, same order, same password rule as the app's own
// RegisterScreen.tsx: display name (optional), country + phone, password +
// confirm, terms. Posts to the same Django endpoint the app uses
// (apps.accounts.views.RegisterView) via app/api/auth/register/route.ts,
// so the resulting account works in both places immediately.
export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("CM");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const dialCode = useMemo(() => findCountry(country)?.dialCode || "", [country]);

  const phoneDigits = phoneNumber.replace(/\D/g, "");
  const phoneValid = phoneDigits.length >= 6;
  const passwordChecks = {
    length: password.length >= 10,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password.length > 0 && password === password2;
  const canSubmit = phoneValid && passwordValid && passwordsMatch && termsAgreed && !pending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          dialCode,
          phoneNumber: phoneDigits,
          country,
          password,
          password2,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || "Unable to create your account.");
        return;
      }
      if (data.pendingVerification) {
        setError("");
        setDone(true);
        return;
      }
      setDone(true);
      router.refresh();
      window.setTimeout(() => router.push(next), 1600);
    } catch {
      setError("Something went wrong creating your account. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="form-status" role="status" aria-live="polite">
        <p><strong>Account created.</strong> You&apos;re signed in here - and you can use this same phone number and password to log into the KIS app too.</p>
      </div>
    );
  }

  return (
    <form className="public-form" onSubmit={handleSubmit} noValidate>
      <label>
        Display name (optional)
        <input
          name="displayName"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </label>
      <label htmlFor="register-country">
        Country
        <CountrySelect id="register-country" value={country} onChange={setCountry} />
      </label>
      <label>
        Phone number
        <div className="phone-input-row">
          <span className="phone-dial-code">{dialCode}</span>
          <input
            name="phoneNumber"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="6XX XXX XXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <ul className="password-checklist">
        <li className={passwordChecks.length ? "met" : ""}>At least 10 characters</li>
        <li className={passwordChecks.upper ? "met" : ""}>One uppercase letter</li>
        <li className={passwordChecks.lower ? "met" : ""}>One lowercase letter</li>
        <li className={passwordChecks.digit ? "met" : ""}>One number</li>
      </ul>
      <label>
        Confirm password
        <input
          name="password2"
          type="password"
          autoComplete="new-password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} />
        <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a></span>
      </label>
      <button className="button primary" type="submit" disabled={!canSubmit}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      {error ? <div className="form-status" role="status" aria-live="polite">{error}</div> : null}
    </form>
  );
}
