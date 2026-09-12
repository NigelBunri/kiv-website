"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Redeems a web-pairing code generated on the phone (Profile -> Manage
// devices -> Web). A code arriving via a scanned QR link (?code=XXXX-XXXX-XX)
// is submitted automatically; typed entry is the fallback for anyone who
// didn't scan.
export function PairForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const codeFromLink = searchParams.get("code") || "";

  const [code, setCode] = useState(codeFromLink);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Pairing codes are single-use: once a redeem succeeds, this same code
  // will always report "invalid/expired" afterward. Without a visible
  // confirmation here, a successful sign-in looked identical to a failed
  // one for the fraction of a second before the redirect landed - easy to
  // mistake as "it didn't work" and go revoke the very session that just
  // signed you in. Showing this explicitly, and holding it on screen
  // briefly before navigating, closes that gap.
  function goToNext() {
    const isCrossOrigin = /^https?:\/\//i.test(next) && !next.startsWith(window.location.origin);
    if (isCrossOrigin) {
      window.location.href = next;
    } else {
      router.push(next);
      router.refresh();
    }
  }

  async function redeem(candidateCode: string) {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: candidateCode }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || "That code didn't work.");
        setPending(false);
        return;
      }
      setSuccess(true);
      setTimeout(goToNext, 1200);
    } catch {
      setError("Something went wrong signing you in. Please try again.");
      setPending(false);
    }
  }

  useEffect(() => {
    if (!codeFromLink || autoSubmitted) return;
    // A code is single-use, but a page reload remounts this component and
    // would otherwise auto-submit the same ?code= link again, guaranteeing
    // "invalid/expired" on a code that may have already signed the user in
    // moments earlier. sessionStorage survives the reload; useState alone
    // doesn't.
    const storageKey = `kis_pair_attempted:${codeFromLink}`;
    if (sessionStorage.getItem(storageKey)) {
      setAutoSubmitted(true);
      setError("This link has already been used in this browser tab. If you're not signed in, generate a fresh code from Profile → Manage devices → Web.");
      return;
    }
    sessionStorage.setItem(storageKey, "1");
    setAutoSubmitted(true);
    void redeem(codeFromLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromLink, autoSubmitted]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void redeem(code);
  }

  if (success) {
    return (
      <div className="public-form">
        <p className="form-status" role="status" aria-live="polite">✓ Signed in — taking you in…</p>
      </div>
    );
  }

  if (codeFromLink && pending && !error) {
    return (
      <div className="public-form">
        <p className="form-note">Signing you in…</p>
      </div>
    );
  }

  return (
    <form className="public-form" onSubmit={onSubmit} noValidate>
      <p className="form-note">
        Open the KIS app, go to Profile → Manage devices → Web, and generate a code. Type it in below to sign in
        on this computer.
      </p>
      <label htmlFor="pair-code">
        Pairing code
        <input
          id="pair-code"
          name="code"
          autoComplete="one-time-code"
          placeholder="XXXX-XXXX-XX"
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
      {error ? (
        <div className="form-status" role="status" aria-live="polite">
          {error}
          {error.toLowerCase().includes("invalid") || error.toLowerCase().includes("expired") ? (
            <>
              {" "}This code may have already been used — a pairing code only works once. Generate a fresh one from
              Profile → Manage devices → Web and try again, without reloading this page.
            </>
          ) : null}
        </div>
      ) : null}
      <p className="form-note">
        Prefer a text message code instead? <a href={`/login?next=${encodeURIComponent(next)}`}>Sign in with your phone number</a>.
      </p>
    </form>
  );
}
