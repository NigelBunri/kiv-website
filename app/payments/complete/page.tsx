import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, Section } from "@/components/PageBlocks";
import { PaymentStatusClient } from "./PaymentStatusClient";

// Deliberately not indexed/canonicalized like a normal content page - this
// is a transactional redirect landing page keyed by a per-checkout tx_ref
// query param, not stable content search engines should surface.
export const metadata: Metadata = {
  title: "Payment status | Kingdom Impact Ventures",
  description: "Confirming the status of your KIS payment.",
  robots: { index: false, follow: false },
};

export default function PaymentsCompletePage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Payment status", href: "/payments/complete" }]} />
      <Section title="Payment status">
        <Suspense fallback={<div className="card">Loading…</div>}>
          <PaymentStatusClient />
        </Suspense>
      </Section>
    </SiteShell>
  );
}
