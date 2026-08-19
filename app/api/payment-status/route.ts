import { NextRequest, NextResponse } from "next/server";

// Server-side proxy to the Django backend's payment-status endpoint —
// called by the payments/complete redirect landing page after a
// Flutterwave checkout. Proxying here (rather than having the browser
// call the Django API directly) avoids a CORS-allowlist dependency
// entirely: server-to-server requests aren't subject to CORS, so this
// works regardless of whether kingdomimpactventures.org has been added to
// Django's CORS_ALLOWED_ORIGINS.
//
// Deliberately forwards only tx_ref/transaction_id — both are opaque,
// unguessable identifiers (tx_ref is a uuid4 hex string), never anything
// that could let a caller act on another user's account.
// The Django backend runs on AWS Lightsail (Docker/GHCR, see the ops
// runbook), not Render — this must stay in sync with that deployment's
// public domain, currently api.kingdomimpactventures.org.
const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

export async function GET(request: NextRequest) {
  const txRef = request.nextUrl.searchParams.get("tx_ref")?.trim() ?? "";
  const transactionId = request.nextUrl.searchParams.get("transaction_id")?.trim() ?? "";

  if (!txRef) {
    return NextResponse.json({ found: false, status: "unknown", detail: "tx_ref is required." }, { status: 400 });
  }

  const apiBase = (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");
  const upstreamUrl = new URL(`${apiBase}/api/v1/billing/payments/status/`);
  upstreamUrl.searchParams.set("tx_ref", txRef);
  if (transactionId) upstreamUrl.searchParams.set("transaction_id", transactionId);

  try {
    const upstream = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      // This page exists specifically to catch a payment whose webhook
      // hasn't landed yet — never serve a cached "still pending" response.
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("payment-status proxy: upstream request failed", error);
    return NextResponse.json(
      { found: false, status: "unknown", detail: "Unable to reach the payment service. Please try again shortly." },
      { status: 502 },
    );
  }
}
