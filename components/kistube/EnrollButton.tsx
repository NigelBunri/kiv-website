"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnrollButton({
  contentId,
  signedIn,
  initialCanEnroll,
  initialHasAccess,
  isFree,
}: {
  contentId: string;
  signedIn: boolean;
  initialCanEnroll: boolean;
  initialHasAccess: boolean;
  isFree: boolean;
}) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(initialHasAccess);
  const [canEnroll, setCanEnroll] = useState(initialCanEnroll);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enroll() {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube/education")}`);
      return;
    }
    if (pending || !canEnroll) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/kistube/education/${contentId}/enroll`, { method: "POST" });
      const payload = await res.json().catch(() => ({}));
      const data = payload?.data;
      const paymentUrl = data?.booking?.payment_url;
      if (res.ok && paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }
      if (res.ok && data) {
        setHasAccess(data.progress != null || data.enrollment?.status === "enrolled" || data.enrollment?.status === "completed");
        setCanEnroll(false);
        router.refresh();
      } else {
        setError(payload?.message || "Couldn't enroll right now.");
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setPending(false);
    }
  }

  if (hasAccess) {
    return <button type="button" className="kt-button kt-button--subscribed" disabled>Enrolled ✓</button>;
  }

  return (
    <div>
      <button type="button" className="kt-button kt-button--primary" onClick={enroll} disabled={pending || !canEnroll}>
        {pending ? "Enrolling…" : isFree ? "Enroll for free" : "Enroll"}
      </button>
      {error && <p style={{ color: "var(--danger)", fontSize: ".8rem", marginTop: ".4rem" }}>{error}</p>}
    </div>
  );
}
