import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, Section } from "@/components/PageBlocks";

// Landing page for Stripe Connect's hosted onboarding return_url/
// refresh_url (see apps.billing.stripe_connect.onboarding_redirect_urls
// in the Django backend) — distinct from /payments/complete, which is
// keyed by a per-checkout tx_ref and expects a buyer's payment
// reference, not a seller finishing payout-account setup. Landing a
// seller there produced a confusing "we couldn't find your payment
// reference" message with no relation to what they'd just done.
export const metadata: Metadata = {
  title: "Stripe setup | Kingdom Impact Ventures",
  description: "Finishing your Stripe payout account setup for KIS.",
  robots: { index: false, follow: false },
};

export default function StripeOnboardingCompletePage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Stripe setup", href: "/payments/onboarding-complete" }]} />
      <Section title="Stripe setup">
        <div className="card">
          <h2>You&apos;re done with Stripe for now</h2>
          <p>
            Whether you finished the whole thing or just stepped away, this page can&apos;t tell which — Stripe
            doesn&apos;t hand that back to us here. Go back to the KIS app and tap <strong>Refresh status</strong> in
            Payments to see whether your payout account is ready to receive money yet. If it isn&apos;t, tap
            Connect with Stripe again to pick up where you left off.
          </p>
          <div className="action-row">
            <a className="button primary" href="kis://">
              Return to the KIS app
            </a>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
