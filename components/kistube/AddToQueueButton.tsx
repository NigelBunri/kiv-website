"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddToQueueButton({ contentId, signedIn }: { contentId: string; signedIn: boolean }) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube")}`);
      return;
    }
    if (pending) return;
    setPending(true);
    const next = !added;
    setAdded(next);
    try {
      const res = next
        ? await fetch("/api/kistube/queue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content_id: contentId }),
          })
        : await fetch("/api/kistube/queue", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content_id: contentId }),
          });
      if (!res.ok) setAdded(!next);
    } catch {
      setAdded(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" className="kt-button kt-button--outline" onClick={toggle} disabled={pending}>
      {added ? "Added to queue" : "Add to queue"}
    </button>
  );
}
