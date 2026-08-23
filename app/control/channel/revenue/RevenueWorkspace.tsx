"use client";

import { useState } from "react";

type Revenue = {
  period_days: number;
  currency: string;
  super_thanks: { total_cents: number; count: number };
  super_chat: { total_cents: number; count: number };
  memberships: { active_count: number; estimated_monthly_cents: number };
  ad_impressions: number;
  total_estimated_cents: number;
};

type PayoutRequest = {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  period_start?: string;
  period_end?: string;
  payment_method_ref?: string;
  notes?: string;
  created_at: string;
};

function formatCents(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export default function RevenueWorkspace({
  channelId,
  initialRevenue,
  initialPayoutRequests,
}: {
  channelId: string;
  initialRevenue: Revenue | null;
  initialPayoutRequests: PayoutRequest[];
}) {
  const [payoutRequests, setPayoutRequests] = useState(initialPayoutRequests);
  const [amount, setAmount] = useState("");
  const [methodRef, setMethodRef] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function requestPayout(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/channel/${channelId}/payout-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_cents: Math.round(Number(amount) * 100),
          currency: initialRevenue?.currency || "USD",
          payment_method_ref: methodRef,
          notes,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to request payout.");
      setPayoutRequests((prev) => [data.data, ...prev]);
      setAmount(""); setMethodRef(""); setNotes("");
      setMessage({ kind: "success", text: "Payout requested." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to request payout." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>Last {initialRevenue?.period_days ?? 30} days</h2>
        {initialRevenue ? (
          <div className="control-list">
            <div className="control-list-row">
              <div className="control-list-row-title">Super Thanks</div>
              <div className="control-list-row-meta">{formatCents(initialRevenue.super_thanks.total_cents, initialRevenue.currency)} · {initialRevenue.super_thanks.count} tips</div>
            </div>
            <div className="control-list-row">
              <div className="control-list-row-title">Super Chat</div>
              <div className="control-list-row-meta">{formatCents(initialRevenue.super_chat.total_cents, initialRevenue.currency)} · {initialRevenue.super_chat.count} tips</div>
            </div>
            <div className="control-list-row">
              <div className="control-list-row-title">Memberships</div>
              <div className="control-list-row-meta">{initialRevenue.memberships.active_count} active · ~{formatCents(initialRevenue.memberships.estimated_monthly_cents, initialRevenue.currency)}/mo estimated</div>
            </div>
            <div className="control-list-row">
              <div className="control-list-row-title">Ad impressions</div>
              <div className="control-list-row-meta">{initialRevenue.ad_impressions} (revenue estimate not yet available)</div>
            </div>
            <div className="control-list-row">
              <div className="control-list-row-title">Total estimated</div>
              <div className="control-list-row-meta">{formatCents(initialRevenue.total_estimated_cents, initialRevenue.currency)}</div>
            </div>
          </div>
        ) : (
          <div className="control-empty">No revenue data yet.</div>
        )}
      </section>

      <section className="control-section">
        <h2>Request a payout</h2>
        <form className="control-form" onSubmit={requestPayout}>
          <label>Amount ({initialRevenue?.currency || "USD"})<input type="number" min={1} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
          <label>Payment method reference<input value={methodRef} onChange={(e) => setMethodRef(e.target.value)} placeholder="Bank account, mobile money…" /></label>
          <label>Notes<textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={creating || !amount}>{creating ? "Requesting…" : "Request payout"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>Payout request history</h2>
        {payoutRequests.length === 0 ? (
          <div className="control-empty">No payout requests yet.</div>
        ) : (
          <div className="control-list">
            {payoutRequests.map((request) => (
              <div key={request.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{formatCents(request.amount_cents, request.currency)}</div>
                  <div className="control-list-row-meta">{new Date(request.created_at).toLocaleDateString()} · {request.notes}</div>
                </div>
                <span className={`control-badge control-badge--${request.status === "approved" || request.status === "paid" ? "active" : "pending"}`}>{request.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
