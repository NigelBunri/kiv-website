"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubscribeButton({
  channelId,
  initialSubscribed,
  signedIn,
  size = "sm",
}: {
  channelId: string;
  initialSubscribed: boolean;
  signedIn: boolean;
  size?: "sm" | "lg";
}) {
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [pending, setPending] = useState(false);

  async function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube")}`);
      return;
    }
    if (pending) return;
    setPending(true);
    const next = !subscribed;
    setSubscribed(next);
    try {
      const res = await fetch(`/api/kistube/channels/${channelId}/subscribe`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) setSubscribed(!next);
    } catch {
      setSubscribed(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={`kt-button ${subscribed ? "kt-button--subscribed" : "kt-button--primary"}`}
      onClick={toggle}
      disabled={pending}
      style={size === "lg" ? { padding: ".65rem 1.5rem" } : undefined}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
}
