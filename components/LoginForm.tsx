"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CountrySelect } from "./CountrySelect";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("CM");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ message: string; useQrInstead?: boolean }>({ message: "" });

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError({ message: "" });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, country, password }),
      });
      const data = await response.json();
      if (!data.success) {
        // Mirrors the mobile app's own handling of this exact error
        // (src/screens/LoginScreen.tsx) - password login from a device
        // Django doesn't already trust for this account is deliberately
        // blocked; the pairing code from the app (Profile -> Manage
        // devices -> Web) is the required next step, not a retry.
        if (data.secondary_device_required || data.error_code === "secondary_device_qr_required") {
          setError({
            message: "This account is already active on another device. Use a pairing code from the app instead.",
            useQrInstead: true,
          });
          return;
        }
        if (data.two_factor_required) {
          setError({ message: "This account has two-factor authentication enabled, which isn't supported on the website yet. Sign in from the KIS app instead." });
          return;
        }
        setError({ message: data.message || "Invalid phone number or password." });
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
      setError({ message: "Something went wrong signing in. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="public-form" onSubmit={login} noValidate>
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
      <label htmlFor="login-password">
        Password
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-required="true"
        />
      </label>
      <button className="button primary" type="submit" disabled={pending || !phone || !password}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {error.message ? (
        <div className="form-status" role="status" aria-live="polite">
          {error.message}
          {error.useQrInstead ? (
            <>
              {" "}
              <a href={`/pair?next=${encodeURIComponent(next)}`}>Use a pairing code</a>.
            </>
          ) : null}
        </div>
      ) : null}
      <p className="form-note">
        Have a pairing code from the app instead? <a href={`/pair?next=${encodeURIComponent(next)}`}>Use it here</a>.
      </p>
    </form>
  );
}
