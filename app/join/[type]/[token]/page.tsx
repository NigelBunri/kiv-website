import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, Section } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";
import { resolveDeepLink, isSupportedLinkType } from "@/lib/link-resolver-api";
import { OpenInApp } from "@/components/website-builder/OpenInApp";

// The single public landing page for every KIS shareable "join" link
// (call/group/partner/community/broadcast-call) - matches the app's own
// existing generic InviteJoin: 'join/:type/:token' route in App.tsx, so
// this and the app's own deep-link handling stay in sync automatically.
//
// A join link's target changes without a rebuild (a new community/group/
// partner invite is generated at any time), so this is deliberately
// dynamic and server-rendered per request, same reasoning as the website
// builder's own public pages.
export const dynamic = "force-dynamic";

type Params = { type: string; token: string };

const TYPE_LABELS: Record<string, string> = {
  call: "call",
  "broadcast-call": "broadcast",
  group: "group",
  community: "community",
  partner: "organization",
};

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { type, token } = await params;
  if (!isSupportedLinkType(type)) {
    return pageMetadata({ title: "Link not found", description: "This link is invalid.", path: `/join/${type}/${token}`, robots: { index: false, follow: false } });
  }
  const result = await resolveDeepLink(type, token);
  const label = TYPE_LABELS[type] ?? "KIS";
  if (result.status !== "ok") {
    return pageMetadata({
      title: `This ${label} link is no longer available`,
      description: "This invite link has expired, been revoked, or is invalid.",
      path: `/join/${type}/${token}`,
      robots: { index: false, follow: false },
    });
  }
  const title = result.name ? `Join ${result.name} on KIS` : `Join this ${label} on KIS`;
  return pageMetadata({
    title,
    description: result.description || `Open KIS to join this ${label}.`,
    path: `/join/${type}/${token}`,
    image: result.avatar_url ? { url: result.avatar_url, width: 1200, height: 630, alt: title } : undefined,
    // Invite links are per-recipient/ephemeral, not evergreen public
    // content - same reasoning DownloadPage/website-builder pages use
    // elsewhere in this repo for anything not meant to be indexed.
    robots: { index: false, follow: false },
  });
}

export default async function JoinLinkPage({ params }: { params: Promise<Params> }) {
  const { type, token } = await params;
  if (!isSupportedLinkType(type)) notFound();

  const result = await resolveDeepLink(type, token);
  const label = TYPE_LABELS[type] ?? "KIS";
  // Calls (and broadcast calls) intentionally never resolve to "ok" with
  // real preview data here - Django doesn't own call data, and Nest's own
  // join endpoint requires auth (see apps.core.link_resolver's module
  // docstring). A generic { status: "ok", name: null } is still the
  // correct case to fall into the same "open the app" CTA below; the
  // real token validation happens once the user is signed in, in-app.
  const deepLink = `https://kingdomimpactventures.org/join/${type}/${token}`;

  if (result.status === "invalid") {
    notFound();
  }

  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Join", href: `/join/${type}/${token}` }]} />
      <div className="join-link-page">
        {result.status === "ok" ? (
          <Section
            title={result.name ? `Join ${result.name}` : `Join this ${label}`}
            body={result.description || `Open KIS to join this ${label}.`}
          >
            <div className="join-link-card">
              {result.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result.avatar_url} alt="" className="join-link-avatar" />
              ) : null}
              <OpenInApp deepLink={deepLink} label={`Open in KIS to join`} />
              <p className="join-link-fallback-note">
                Don&apos;t have KIS yet? Opening this link will take you to get the app.
              </p>
            </div>
          </Section>
        ) : (
          <Section
            title={result.status === "expired" ? "This link has expired" : "This link is no longer active"}
            body={result.detail || "Ask whoever shared this link to send you a new one."}
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
