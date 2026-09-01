"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Mirrors SubscribeButton's optimistic-toggle-with-rollback pattern, but
// endorsing a testimony is a one-way action (no un-endorse endpoint), so
// once it succeeds the button just stays in its "Endorsed" resting state.
export function EndorseButton({
  testimonyId,
  initialCount,
  signedIn,
}: {
  testimonyId: string;
  initialCount: number;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [endorsed, setEndorsed] = useState(false);
  const [pending, setPending] = useState(false);

  async function endorse(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube/testimonies")}`);
      return;
    }
    if (pending || endorsed) return;
    setPending(true);
    setCount((c) => c + 1);
    setEndorsed(true);
    try {
      const res = await fetch(`/api/kistube/testimonies/${testimonyId}/endorse`, { method: "POST" });
      if (!res.ok) {
        setCount((c) => c - 1);
        setEndorsed(false);
      }
    } catch {
      setCount((c) => c - 1);
      setEndorsed(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={`kt-button ${endorsed ? "kt-button--subscribed" : "kt-button--outline"}`}
      onClick={endorse}
      disabled={pending || endorsed}
    >
      {endorsed ? "Endorsed" : "Endorse"} · {count}
    </button>
  );
}
