"use client";

import { useState } from "react";

// Shared by Shop, Health institution, Education institution, and Broadcast
// channel - all four expose the identical POST .../payout-account/connect/
// endpoint (account_bank/account_number/business_name/country -> Flutterwave
// subaccount), so one component drives all four. Stripe Connect exists on
// the same four backends too, but its hosted-onboarding redirect always
// returns to a generic "go back to the app" page today (see
// apps/billing/stripe_connect.py's onboarding_redirect_urls) rather than
// back to this control panel page, so it's left app-only for now rather
// than landing someone on a confusing redirect.
export default function PayoutAccountConnectPanel({
  apiPath,
  initialStatus,
  initialName,
  initialBankLast4,
}: {
  apiPath: string;
  initialStatus?: string;
  initialName?: string;
  initialBankLast4?: string;
}) {
  const [status, setStatus] = useState(initialStatus || "not_connected");
  const [name, setName] = useState(initialName || "");
  const [bankLast4, setBankLast4] = useState(initialBankLast4 || "");
  const [accountBank, setAccountBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [country, setCountry] = useState("NG");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const isActive = status === "active";

  async function handleConnect(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_bank: accountBank,
          account_number: accountNumber,
          business_name: businessName || undefined,
          country,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to connect payout account.");
      setStatus(data.data?.payout_account_status || "active");
      setName(data.data?.payout_account_name || businessName);
      setBankLast4(data.data?.payout_bank_last4 || "");
      setAccountBank(""); setAccountNumber(""); setBusinessName("");
      setMessage({ kind: "success", text: "Payout account connected." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to connect payout account." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Payout account</h2>
      <p>Connect a bank account (via Flutterwave) so payments settle directly to you.</p>
      <p>
        <strong>
          {isActive ? `Connected - ${name || "account"}${bankLast4 ? ` (••••${bankLast4})` : ""}` : "Not connected"}
        </strong>
      </p>
      <form className="control-form" onSubmit={handleConnect}>
        <label>Bank<input value={accountBank} onChange={(e) => setAccountBank(e.target.value)} placeholder="e.g. 044 or bank name" required /></label>
        <label>Account number<input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required /></label>
        <label>Business name (optional)<input value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></label>
        <label>
          Country
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="NG">Nigeria</option>
            <option value="GH">Ghana</option>
            <option value="KE">Kenya</option>
            <option value="CM">Cameroon</option>
            <option value="ZA">South Africa</option>
          </select>
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={busy || !accountBank || !accountNumber}>
            {busy ? "Connecting…" : isActive ? "Reconnect" : "Connect payout account"}
          </button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
