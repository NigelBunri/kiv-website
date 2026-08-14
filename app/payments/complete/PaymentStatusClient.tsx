"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type PaymentStatusResult = {
  found: boolean;
  status: "paid" | "pending" | "failed" | "cancelled" | "unknown";
  kind?: string;
  tier_name?: string;
  detail?: string;
};

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 6; // ~18s of polling before giving up and asking the user to check the app

const KIND_LABELS: Record<string, string> = {
  tier_upgrade: "account upgrade",
  education_booking: "class booking",
  marketplace_order: "order",
  service_booking_payment: "booking",
  health_billing_session: "appointment payment",
  wallet_payment: "payment",
};

function describeKind(kind?: string): string {
  if (!kind) return "payment";
  return KIND_LABELS[kind] ?? kind.replace(/_/g, " ");
}

export function PaymentStatusClient() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get("tx_ref")?.trim() ?? "";
  const transactionId = searchParams.get("transaction_id")?.trim() ?? "";
  const redirectStatus = searchParams.get("status")?.trim().toLowerCase() ?? "";

  const [result, setResult] = useState<PaymentStatusResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!txRef) return;
    if (result && result.status !== "pending" && result.status !== "unknown") return;
    if (attempts >= MAX_POLLS) return;

    const controller = new AbortController();
    const runCheck = async () => {
      try {
        const params = new URLSearchParams({ tx_ref: txRef });
        if (transactionId) params.set("transaction_id", transactionId);
        const response = await fetch(`/api/payment-status?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = (await response.json()) as PaymentStatusResult;
        if (cancelledRef.current) return;
        setResult(data);
        setError(null);
      } catch (err) {
        if (cancelledRef.current || controller.signal.aborted) return;
        console.error("payment-status check failed", err);
        setError("We couldn't reach KIS to confirm your payment. Retrying…");
      } finally {
        if (!cancelledRef.current) setAttempts((count) => count + 1);
      }
    };

    const delay = attempts === 0 ? 0 : POLL_INTERVAL_MS;
    const timer = setTimeout(runCheck, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [txRef, transactionId, attempts, result?.status]);

  if (!txRef) {
    return (
      <div className="card" role="alert">
        <h2>We couldn&apos;t find your payment reference</h2>
        <p>This page expects a payment reference from KIS checkout. If you completed a payment and landed here without one, please check the KIS app directly — your account may already be updated.</p>
        <ReturnToAppButton />
      </div>
    );
  }

  const status = result?.status ?? "pending";
  const stillChecking = (status === "pending" || status === "unknown") && attempts < MAX_POLLS;

  if (stillChecking) {
    return (
      <div className="card" aria-live="polite">
        <h2>Confirming your payment…</h2>
        <p>Flutterwave told us this checkout was {redirectStatus || "submitted"}. We&apos;re confirming it with KIS now — this usually takes a few seconds.</p>
        {error ? <p style={{ color: "var(--muted, #6b6355)" }}>{error}</p> : null}
        <div className="spinner" aria-hidden="true" />
      </div>
    );
  }

  if (status === "paid") {
    const kindLabel = describeKind(result?.kind);
    return (
      <div className="card">
        <h2>Payment confirmed</h2>
        <p>
          Your {kindLabel}
          {result?.tier_name ? ` to ${result.tier_name}` : ""} is confirmed. Open the KIS app to see it reflected on your account.
        </p>
        <ReturnToAppButton />
      </div>
    );
  }

  if (status === "failed" || status === "cancelled") {
    return (
      <div className="card">
        <h2>Payment {status === "cancelled" ? "cancelled" : "didn't go through"}</h2>
        <p>Your card was not charged successfully. You can return to the KIS app and try again, or use a different payment method.</p>
        <ReturnToAppButton />
      </div>
    );
  }

  // Exhausted MAX_POLLS while still pending/unknown — a real payment can
  // still complete after this (the webhook may simply be slow), so this is
  // deliberately worded as "still confirming," never "failed."
  return (
    <div className="card">
      <h2>Still confirming your payment</h2>
      <p>
        This is taking longer than expected to confirm. If Flutterwave charged your card, your account will update
        automatically — please check the KIS app in a few minutes. If it still hasn&apos;t updated, contact support with
        this reference: <code>{txRef}</code>
      </p>
      <ReturnToAppButton />
    </div>
  );
}

function ReturnToAppButton() {
  return (
    <div className="action-row">
      <a className="button primary" href="kis://">
        Return to the KIS app
      </a>
    </div>
  );
}
