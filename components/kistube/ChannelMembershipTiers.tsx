"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MembershipTier } from "@/lib/kistube-api";

// Client Component - the coordinator fetches tiers server-side
// (fetchMembershipTiers) and passes them in, since joining needs
// client-side interactivity but listing doesn't.
export function ChannelMembershipTiers({ channelId, tiers, signedIn }: { channelId: string; tiers: MembershipTier[]; signedIn: boolean }) {
  const router = useRouter();
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set(tiers.filter((t) => t.is_joined).map((t) => t.id)));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function join(tierId: string) {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube")}`);
      return;
    }
    setPendingId(tierId);
    setError(null);
    try {
      const res = await fetch(`/api/kistube/channels/${channelId}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier_id: tierId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.data?.joined) {
        setJoinedIds((prev) => new Set(prev).add(tierId));
      } else if (res.ok && data?.data?.payment_required && (data.data.payment_url || data.data.checkout_url)) {
        window.location.href = data.data.payment_url || data.data.checkout_url;
      } else {
        setError(data?.message || "Couldn't join that tier right now.");
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setPendingId(null);
    }
  }

  if (tiers.length === 0) return null;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h2 className="kt-related-heading">Memberships</h2>
      {error && <p style={{ color: "var(--danger)", fontSize: ".85rem", marginBottom: ".5rem" }}>{error}</p>}
      <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {tiers.map((tier) => {
          const joined = joinedIds.has(tier.id);
          const priceLabel = tier.price_cents > 0 ? `${(tier.price_cents / 100).toFixed(2)} ${tier.currency}/mo` : "Free";
          return (
            <div key={tier.id} style={{ border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
              <div style={{ fontWeight: 700, marginBottom: ".2rem" }}>{tier.title}</div>
              <div className="kt-card-meta" style={{ marginBottom: ".5rem" }}>{priceLabel}</div>
              {tier.description && <p style={{ fontSize: ".85rem", marginBottom: ".5rem" }}>{tier.description}</p>}
              {tier.perks.length > 0 && (
                <ul style={{ margin: "0 0 .75rem", paddingLeft: "1.1rem", fontSize: ".82rem" }}>
                  {tier.perks.map((perk, i) => <li key={i}>{perk}</li>)}
                </ul>
              )}
              <button
                type="button"
                className={`kt-button ${joined ? "kt-button--subscribed" : "kt-button--primary"}`}
                onClick={() => !joined && join(tier.id)}
                disabled={joined || pendingId === tier.id}
              >
                {joined ? "Joined" : pendingId === tier.id ? "Joining…" : "Join"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
