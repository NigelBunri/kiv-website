import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchChannelContents, fetchPublicChannel } from "@/lib/kistube-api";
import { ContentCard } from "@/components/kistube/ContentCard";
import { SubscribeButton } from "@/components/kistube/SubscribeButton";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
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

export default async function KISTubeChannelPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [channel, { viewer }] = await Promise.all([fetchPublicChannel(handle), getKisTubeSidebarData()]);
  if (!channel) notFound();

  const contents = await fetchChannelContents(channel.id, { limit: 24 });
  const videos = contents?.results ?? channel.latest_contents ?? [];

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

      <h2 className="kt-related-heading" style={{ marginTop: "1.5rem" }}>Videos</h2>
      {videos.length === 0 ? (
        <KISTubeEmptyState title="No content yet" body="This channel hasn't published anything yet — check back soon." />
      ) : (
        <div className="kt-grid">
          {videos.map((content) => <ContentCard key={content.id} content={content} />)}
        </div>
      )}
    </div>
  );
}
