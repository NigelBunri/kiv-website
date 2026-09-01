import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchChannelContents, fetchMembershipTiers, fetchPublicChannel } from "@/lib/kistube-api";
import { ContentCard } from "@/components/kistube/ContentCard";
import { SubscribeButton } from "@/components/kistube/SubscribeButton";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { ChannelTabs } from "@/components/kistube/ChannelTabs";
import { ChannelLiveNowBanner } from "@/components/kistube/ChannelLiveNowBanner";
import { ChannelShelves } from "@/components/kistube/ChannelShelves";
import { ChannelMembershipTiers } from "@/components/kistube/ChannelMembershipTiers";
import { ChannelPlaylistsTab } from "@/components/kistube/ChannelPlaylistsTab";
import { ChannelCommunityFeed } from "@/components/kistube/ChannelCommunityFeed";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";
import { kistubeChannelDeepLink } from "@/lib/kistube-deeplink";
import { OpenInApp } from "@/components/website-builder/OpenInApp";
import { JsonLd } from "@/components/StructuredData";
import { formatCount } from "@/lib/kistube-format";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const channel = await fetchPublicChannel(handle);
  if (!channel) return kistubeMetadata({ title: "Channel", description: "KISTube channel.", path: `/kistube/channel/${handle}`, robots: { index: false, follow: false } });
  return kistubeMetadata({
    title: channel.seo?.title || channel.display_name,
    description: channel.seo?.description || channel.description || `${channel.display_name} on KISTube.`,
    path: `/kistube/channel/${channel.handle}`,
    image: channel.avatar_url ? { url: channel.avatar_url, width: 400, height: 400, alt: channel.display_name } : undefined,
    robots: channel.seo?.robots === "index,follow" ? { index: true, follow: true } : kistubeRobots(false),
  });
}

export default async function KISTubeChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { handle } = await params;
  const { tab: tabParam } = await searchParams;
  const tab = (["videos", "playlists", "community", "about"].includes(tabParam || "") ? tabParam : "videos") as "videos" | "playlists" | "community" | "about";

  const [channel, { viewer }] = await Promise.all([fetchPublicChannel(handle), getKisTubeSidebarData()]);
  if (!channel) notFound();

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: channel.display_name,
          description: channel.description,
          url: channel.url,
          logo: channel.avatar_url,
        }}
      />
      {channel.banner_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={channel.banner_url} alt="" style={{ width: "100%", aspectRatio: "6/1", objectFit: "cover", borderRadius: "var(--radius-md)", marginBottom: "1.25rem" }} />
      )}
      <div className="kt-watch-channel-row" style={{ borderBottom: "none", paddingTop: 0 }}>
        <div className="kt-watch-channel-info">
          {channel.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={channel.avatar_url} alt="" style={{ width: 72, height: 72, borderRadius: "999px", objectFit: "cover" }} />
          ) : (
            <span className="kt-channel-card-avatar" style={{ width: 72, height: 72 }} />
          )}
          <div>
            <h1 className="kt-page-heading" style={{ margin: 0 }}>
              {channel.display_name}
              {channel.trust_badges && channel.trust_badges.length > 0 && <span className="kt-verified-badge">✓</span>}
            </h1>
            <div className="kt-card-meta">
              {formatCount(channel.subscriber_count)} subscribers · {formatCount(channel.content_count)} videos
            </div>
          </div>
        </div>
        <div className="kt-watch-actions">
          <SubscribeButton channelId={channel.id} initialSubscribed={false} signedIn={viewer.signedIn} size="lg" />
          <OpenInApp deepLink={kistubeChannelDeepLink(channel.handle)} />
          <Link href={channel.report.url} className="kt-button kt-button--outline">Report</Link>
        </div>
      </div>

      {channel.description && <p className="kt-watch-description" style={{ marginTop: "1rem" }}>{channel.description}</p>}

      <ChannelLiveNowBanner channelId={channel.id} />

      <ChannelTabs handle={channel.handle} active={tab} />

      {tab === "videos" && (
        <>
          <ChannelShelves channelId={channel.id} />
          <ChannelMembershipTiersSection channelId={channel.id} signedIn={viewer.signedIn} />
          <VideosTab channelId={channel.id} fallback={channel.latest_contents ?? []} />
        </>
      )}
      {tab === "playlists" && <ChannelPlaylistsTab channelId={channel.id} />}
      {tab === "community" && <ChannelCommunityFeed channelId={channel.id} signedIn={viewer.signedIn} />}
      {tab === "about" && (
        <div style={{ maxWidth: 640 }}>
          <h2 className="kt-related-heading">About</h2>
          <p className="kt-watch-description">{channel.description || "This channel hasn't added a description yet."}</p>
          <div className="kt-card-meta">
            {formatCount(channel.subscriber_count)} subscribers · {formatCount(channel.content_count)} videos
            {channel.category ? ` · ${channel.category}` : ""}
            {channel.country ? ` · ${channel.country}` : ""}
          </div>
        </div>
      )}
    </div>
  );
}

async function VideosTab({ channelId, fallback }: { channelId: string; fallback: import("@/lib/kistube-api").ContentCard[] }) {
  const contents = await fetchChannelContents(channelId, { limit: 24 });
  const videos = contents?.results ?? fallback;

  return (
    <>
      <h2 className="kt-related-heading">Videos</h2>
      {videos.length === 0 ? (
        <KISTubeEmptyState title="No content yet" body="This channel hasn't published anything yet — check back soon." />
      ) : (
        <div className="kt-grid">
          {videos.map((content) => <ContentCard key={content.id} content={content} />)}
        </div>
      )}
    </>
  );
}

async function ChannelMembershipTiersSection({ channelId, signedIn }: { channelId: string; signedIn: boolean }) {
  const tiers = await fetchMembershipTiers(channelId);
  return <ChannelMembershipTiers channelId={channelId} tiers={tiers} signedIn={signedIn} />;
}
