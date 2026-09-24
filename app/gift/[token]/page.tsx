import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, Section } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";
import { resolveDeepLink } from "@/lib/link-resolver-api";
import { OpenInApp } from "@/components/website-builder/OpenInApp";

// Public landing page for a gift-membership share link
// (KIS_PUBLIC_WEB_BASE_URL + "/gift/<token>", built by
// apps.broadcasts.views.deliver_gift_membership_notice). Standalone route
// rather than nested under /join/[type]/[token] because the app's own
// GiftMembershipRedeem: 'gift/:token' deep-link config already expects
// that exact path - this page just needs to match it.
//
// Comms migration (Sep 2026): previously this path 404'd outright (no
// page existed) and neither native platform recognized
// kingdomimpactventures.org as an associated/app-link domain anyway, so
// even a correct page wouldn't have opened the app. This uses the same
// working mechanism the /join pages already use in production: a kis://
// custom-scheme click attempt (already registered on both platforms) with
// a JS timeout fallback to the store/download page - not a Universal
// Link, which would need AASA/assetlinks files this domain doesn't serve.
export const dynamic = "force-dynamic";

type Params = { token: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { token } = await params;
  const result = await resolveDeepLink("gift", token);
  if (result.status !== "ok") {
    return pageMetadata({
      title: "This gift link is no longer available",
      description: "This gift link has expired, been redeemed, or is invalid.",
      path: `/gift/${token}`,
      robots: { index: false, follow: false },
    });
  }
  return pageMetadata({
    title: result.name ? `You've been gifted a membership on ${result.name}` : "You've been gifted a KIS membership",
    description: result.description || "Open KIS to redeem your gift membership.",
    path: `/gift/${token}`,
    // Gift links are per-recipient and single-use, not evergreen public
    // content - same reasoning the /join pages use.
    robots: { index: false, follow: false },
  });
}

export default async function GiftLinkPage({ params }: { params: Promise<Params> }) {
  const { token } = await params;
  const result = await resolveDeepLink("gift", token);
  const deepLink = `https://kingdomimpactventures.org/gift/${token}`;

  if (result.status === "invalid") {
    notFound();
  }

  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Gift", href: `/gift/${token}` }]} />
      <div className="join-link-page">
        {result.status === "ok" ? (
          <Section
            title={result.name ? `You've been gifted a membership on ${result.name}` : "You've been gifted a KIS membership"}
            body={result.description || "Open KIS to redeem your gift membership."}
          >
            <div className="join-link-card">
              <OpenInApp deepLink={deepLink} label="Open in KIS to redeem" />
              <p className="join-link-fallback-note">
                Don&apos;t have KIS yet? Opening this link will take you to get the app.
              </p>
            </div>
          </Section>
        ) : (
          <Section
            title={result.status === "expired" ? "This gift link has expired" : "This gift is no longer available"}
            body={result.detail || "Ask whoever sent this gift for a new link."}
          >
            <div className="join-link-card">
              <a className="button primary" href="/download">
                Get KIS
              </a>
            </div>
          </Section>
        )}
      </div>
    </SiteShell>
  );
}
