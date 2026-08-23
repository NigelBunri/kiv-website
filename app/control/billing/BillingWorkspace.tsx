"use client";

import { useState } from "react";

type Subscription = {
  id: string;
  status: string;
  started_at?: string;
  ends_at?: string | null;
  cancel_at_period_end?: boolean;
  grace_ends_at?: string | null;
} | null;

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

export default function BillingWorkspace({ tierName, initialSubscription }: { tierName: string; initialSubscription: Subscription }) {
  const [subscription, setSubscription] = useState(initialSubscription);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const isPendingCancel = Boolean(subscription?.cancel_at_period_end);

  async function handleCancel(immediate: boolean) {
    const confirmed = window.confirm(
      immediate
        ? "Cancel immediately? You'll lose access to your current tier's features right away."
        : "Cancel at the end of your current billing period? You'll keep access until then.",
    );
    if (!confirmed) return;
    setBusy(true);
    setMessage(null);
    try {
      const data = await postJson("/api/control/billing/subscription-cancel", { immediate });
      setSubscription(data.subscription);
      setMessage({ kind: "success", text: immediate ? "Subscription cancelled." : "Subscription will end at the current period." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to cancel subscription." });
    } finally {
      setBusy(false);
    }
  }

  async function handleResume() {
    setBusy(true);
    setMessage(null);
    try {
      const data = await postJson("/api/control/billing/subscription-resume");
      setSubscription(data.subscription);
      setMessage({ kind: "success", text: "Subscription resumed." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to resume subscription." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Current plan</h2>
      <div className="control-stat-grid">
        <div className="control-stat-card"><span>Plan</span><strong>{tierName}</strong></div>
        {subscription ? (
          <div className="control-stat-card"><span>Status</span><strong>{subscription.status}</strong></div>
        ) : null}
      </div>

      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      {!subscription ? (
        <p className="control-note">No active paid subscription on file — you&rsquo;re on the free tier or your plan is managed another way (e.g. an app-store subscription).</p>
      ) : (
        <>
          {subscription.ends_at ? (
            <p>
              {isPendingCancel ? "Access ends" : "Renews"} on {new Date(subscription.ends_at).toLocaleDateString()}
              {isPendingCancel ? " — your subscription is set to cancel." : ""}
            </p>
          ) : null}
          <div className="control-actions">
            {isPendingCancel ? (
              <button type="button" className="button primary" onClick={handleResume} disabled={busy}>
                {busy ? "Resuming…" : "Resume subscription"}
              </button>
            ) : (
              <>
                <button type="button" className="button" onClick={() => handleCancel(false)} disabled={busy}>
                  Cancel at period end
                </button>
                <button type="button" className="button" onClick={() => handleCancel(true)} disabled={busy}>
                  Cancel immediately
                </button>
              </>
            )}
          </div>
        </>
      )}
      <p className="control-note">
        To change to a different tier, use the KIS app for now — plan switching isn&rsquo;t available here yet.
      </p>
    </section>
  );
}
