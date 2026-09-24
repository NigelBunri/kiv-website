import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, Section } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";
import { resolveDeepLink } from "@/lib/link-resolver-api";
import { OpenInApp } from "@/components/website-builder/OpenInApp";

// Public landing page for a livestream co-host/guest invite share link
// (KIS_PUBLIC_WEB_BASE_URL + "/live-guest/<token>", built by
// apps.broadcasts.views.deliver_livestream_guest_invite_notice). See
// app/gift/[token]/page.tsx's module docstring for why this is a
// standalone route and why it opens the app via the kis:// custom scheme
// rather than a Universal Link.
export const dynamic = "force-dynamic";

type Params = { token: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { token } = await params;
  const result = await resolveDeepLink("live-guest", token);
  if (result.status !== "ok") {
    return pageMetadata({
      title: "This invitation is no longer available",
      description: "This livestream guest invitation has expired, ended, or is invalid.",
      path: `/live-guest/${token}`,
      robots: { index: false, follow: false },
    });
  }
  return pageMetadata({
    title: result.name ? `You're invited to join ${result.name}'s livestream` : "You're invited to a KIS livestream",
    description: result.description || "Open KIS to join this livestream.",
    path: `/live-guest/${token}`,
    robots: { index: false, follow: false },
  });
}

export default async function LiveGuestLinkPage({ params }: { params: Promise<Params> }) {
  const { token } = await params;
  const result = await resolveDeepLink("live-guest", token);
  const deepLink = `https://kingdomimpactventures.org/live-guest/${token}`;

  if (result.status === "invalid") {
    notFound();
  }

  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Livestream invite", href: `/live-guest/${token}` }]} />
      <div className="join-link-page">
        {result.status === "ok" ? (
          <Section
            title={result.name ? `You're invited to join ${result.name}'s livestream` : "You're invited to a KIS livestream"}
            body={result.description || "Open KIS to join this livestream."}
          >
            <div className="join-link-card">
              <OpenInApp deepLink={deepLink} label="Open in KIS to join" />
              <p className="join-link-fallback-note">
                Don&apos;t have KIS yet? Opening this link will take you to get the app.
              </p>
            </div>
          </Section>
        ) : (
          <Section
            title={result.status === "expired" ? "This invitation has expired" : "This invitation is no longer available"}
            body={result.detail || "Ask whoever invited you for a new link."}
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
