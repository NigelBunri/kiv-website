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
  const [autoSubmitted, setAutoSubmitted] = useState(false);

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
        return;
      }
      // See LoginForm.tsx's identical fix: `next` can now be a
      // fully-qualified cross-origin URL back to kistube.
      // kingdomimpactventures.org, which router.push() can't navigate to.
      const isCrossOrigin = /^https?:\/\//i.test(next) && !next.startsWith(window.location.origin);
      if (isCrossOrigin) {
        window.location.href = next;
      } else {
        router.push(next);
        router.refresh();
      }
    } catch {
      setError("Something went wrong signing you in. Please try again.");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (codeFromLink && !autoSubmitted) {
      setAutoSubmitted(true);
      void redeem(codeFromLink);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromLink, autoSubmitted]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void redeem(code);
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
      {error ? <div className="form-status" role="status" aria-live="polite">{error}</div> : null}
      <p className="form-note">
        Prefer a text message code instead? <a href={`/login?next=${encodeURIComponent(next)}`}>Sign in with your phone number</a>.
      </p>
    </form>
  );
}
