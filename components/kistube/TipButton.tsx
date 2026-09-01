"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Self-contained - the coordinator drops <TipButton contentId={...}
// signedIn={...} /> near the other watch-page action buttons.
export function TipButton({ contentId, signedIn }: { contentId: string; signedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(5);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openPanel() {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube")}`);
      return;
    }
    setOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/kistube/contents/${contentId}/tips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_cents: Math.round(amount * 100), message: message.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.data?.payment_url) {
        window.location.href = data.data.payment_url;
      } else {
        setError(data?.message || "Couldn't start that tip — try again.");
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="kt-button kt-button--outline" onClick={openPanel}>
        Tip
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button type="button" className="kt-button kt-button--outline" onClick={() => setOpen(false)}>Tip</button>
      <div className="kt-profile-menu is-open" style={{ width: 260, right: 0 }}>
        <form onSubmit={submit} style={{ padding: ".7rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
          <label style={{ fontSize: ".8rem", fontWeight: 700 }}>
            Amount (USD)
            <input
              type="number" min={1} step={1} value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              style={{ display: "block", width: "100%", marginTop: 4, border: "1.5px solid var(--line)", borderRadius: "var(--radius-sm)", padding: ".4rem .6rem" }}
            />
          </label>
          <label style={{ fontSize: ".8rem", fontWeight: 700 }}>
            Message (optional)
            <input
              type="text" value={message} maxLength={200}
              onChange={(event) => setMessage(event.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4, border: "1.5px solid var(--line)", borderRadius: "var(--radius-sm)", padding: ".4rem .6rem" }}
            />
          </label>
          {error && <p style={{ color: "var(--danger)", fontSize: ".8rem" }}>{error}</p>}
          <button type="submit" className="kt-button kt-button--primary" disabled={pending || amount < 1}>
            {pending ? "Starting…" : `Send $${amount}`}
          </button>
        </form>
      </div>
    </div>
  );
}
