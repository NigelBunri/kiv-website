"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Self-fetching rather than a prop from SiteShell - SiteShell is a client
// component rendered on every page, and reading the session cookie
// requires a server-side call (next/headers). Keeping this decoupled
// avoids turning every page's SiteShell usage into something that needs
// server-side session plumbing threaded through it.
export function UserMenu() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setSignedIn(Boolean(data?.signedIn)); })
      .catch(() => { if (!cancelled) setSignedIn(false); });
    return () => { cancelled = true; };
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setSigningOut(false);
      setSignedIn(false);
      router.refresh();
    }
  }

  if (signedIn === null) return null; // avoid a signed-out flash while the check is in flight

  if (!signedIn) {
    return <a className="header-button header-button--light" href="/login">Sign in</a>;
  }

  return (
    <>
      {/* Always shown once signed in - /control itself shows an upgrade
          message for tiers below Business Pro, so this link doesn't need
          to know the viewer's tier just to decide whether to render. */}
      <a className="header-button header-button--light" href="/control">Control panel</a>
      <button type="button" className="header-button header-button--light" onClick={signOut} disabled={signingOut}>
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </>
  );
}
