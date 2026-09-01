import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchContentComments, fetchPublicContent, fetchRelatedContent, fetchSubtitles } from "@/lib/kistube-api";
import { SubscribeButton } from "@/components/kistube/SubscribeButton";
import { CommentsSection, ReactionButton, ShareButton, ViewRecorder } from "@/components/kistube/WatchInteractions";
import { SaveToPlaylistMenu } from "@/components/kistube/SaveToPlaylistMenu";
import { AddToQueueButton } from "@/components/kistube/AddToQueueButton";
import { DownloadButton } from "@/components/kistube/DownloadButton";
import { TipButton } from "@/components/kistube/TipButton";
import { CreateClipButton } from "@/components/kistube/CreateClipButton";
import { LiveWatchPanel } from "@/components/kistube/LiveWatchPanel";
import { PremiereCountdown } from "@/components/kistube/PremiereCountdown";
import { GeoRestrictionNotice } from "@/components/kistube/GeoRestrictionNotice";
import { VideoChapters } from "@/components/kistube/VideoChapters";
import { VideoCards } from "@/components/kistube/VideoCards";
import { TranscriptPanel } from "@/components/kistube/TranscriptPanel";
import { AudioTrackList } from "@/components/kistube/AudioTrackList";
import { ProductTags } from "@/components/kistube/ProductTags";
import { PublicClipsRow } from "@/components/kistube/PublicClipsRow";
import { PollVoteWidget } from "@/components/kistube/PollVoteWidget";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";
import { kistubeContentDeepLink } from "@/lib/kistube-deeplink";
import { OpenInApp } from "@/components/website-builder/OpenInApp";
import { JsonLd } from "@/components/StructuredData";
import { formatRelativeTime } from "@/lib/kistube-format";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const content = await fetchPublicContent(id);
  if (!content) return kistubeMetadata({ title: "Video", description: "KISTube video.", path: `/kistube/watch/${id}`, robots: { index: false, follow: false } });
  return kistubeMetadata({
    title: content.seo?.title || content.title,
    description: content.seo?.description || content.description || `Watch ${content.title} on KISTube.`,
    path: `/kistube/watch/${content.id}`,
    type: "article",
    image: content.thumbnail_url ? { url: content.thumbnail_url, width: 1200, height: 675, alt: content.title } : undefined,
    robots: content.seo?.robots === "index,follow" ? { index: true, follow: true } : kistubeRobots(false),
  });
}

export default async function KISTubeWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [content, { viewer }] = await Promise.all([fetchPublicContent(id), getKisTubeSidebarData()]);
  if (!content) notFound();

  const isLiveStream = content.content_type === "live_stream";
  const isPoll = content.content_type === "poll";

  const [related, comments, subtitles] = await Promise.all([
    fetchRelatedContent(content.id),
    fetchContentComments(content.id),
    isLiveStream || isPoll ? Promise.resolve([]) : fetchSubtitles(content.id),
  ]);
  const asset = content.asset;
  const isVideo = (asset.mime_type || "").startsWith("video") || content.content_type === "video" || content.content_type === "short_video";
  const isAudio = (asset.mime_type || "").startsWith("audio") || content.content_type === "audio";

  return (
    <div className="kt-watch-layout">
      <div>
        {!isLiveStream && <ViewRecorder contentId={content.id} />}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": isVideo ? "VideoObject" : "CreativeWork",
            name: content.title,
            description: content.description,
            thumbnailUrl: content.thumbnail_url,
            uploadDate: undefined,
            contentUrl: asset.url,
            embedUrl: content.embed?.oembed_url,
          }}
        />

        {isLiveStream ? (
          <LiveWatchPanel contentId={content.id} channelId={content.channel.id} signedIn={viewer.signedIn} />
        ) : (
          <>
            <PremiereCountdown contentId={content.id} />
            <GeoRestrictionNotice contentId={content.id} />
            <div className="kt-player-wrap">
              {isVideo && asset.url ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={asset.url} poster={content.thumbnail_url} controls playsInline>
                  {subtitles.map((track) => (
                    <track key={track.id} kind="subtitles" src={track.vtt_url} srcLang={track.language} label={track.label || track.language} />
                  ))}
                </video>
              ) : isAudio && asset.url ? (
                <div style={{ display: "grid", placeItems: "center", height: "100%", background: "var(--cream-2)" }}>
                  <audio src={asset.url} controls style={{ width: "90%" }} />
                </div>
              ) : content.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={content.thumbnail_url} alt={content.title} />
              ) : (
                <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#fff" }}>No preview available</div>
              )}
            </div>
          </>
        )}

        <h1 className="kt-watch-title">{content.title}</h1>

        <div className="kt-watch-channel-row">
          <Link href={`/kistube/channel/${content.channel.handle}`} className="kt-watch-channel-info" style={{ textDecoration: "none", color: "inherit" }}>
            {content.channel.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={content.channel.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: 999, objectFit: "cover" }} />
            ) : (
              <span className="kt-card-channel-avatar" />
            )}
            <div>
              <div style={{ fontWeight: 700 }}>{content.channel.display_name}</div>
              <div className="kt-card-meta">{content.channel.subscriber_count} subscribers</div>
            </div>
          </Link>
          <div className="kt-watch-actions">
            <SubscribeButton channelId={content.channel.id} initialSubscribed={false} signedIn={viewer.signedIn} />
            <ReactionButton contentId={content.id} signedIn={viewer.signedIn} />
            <SaveToPlaylistMenu contentId={content.id} signedIn={viewer.signedIn} />
            {!isLiveStream && <AddToQueueButton contentId={content.id} signedIn={viewer.signedIn} />}
            <ShareButton url={content.url} />
            {!isLiveStream && <TipButton contentId={content.id} signedIn={viewer.signedIn} />}
            {isVideo && !isLiveStream && <CreateClipButton contentId={content.id} signedIn={viewer.signedIn} />}
            {!isLiveStream && <DownloadButton contentId={content.id} signedIn={viewer.signedIn} />}
            <OpenInApp deepLink={kistubeContentDeepLink(content.id)} />
            <Link href={content.report.url} className="kt-button kt-button--outline">Report</Link>
          </div>
        </div>

        {content.description && <p className="kt-watch-description">{content.description}</p>}

        {isPoll && <PollVoteWidget contentId={content.id} signedIn={viewer.signedIn} />}

        {!isLiveStream && !isPoll && (
          <>
            <VideoChapters contentId={content.id} />
            <VideoCards contentId={content.id} />
            <ProductTags contentId={content.id} />
            <AudioTrackList contentId={content.id} />
            <TranscriptPanel contentId={content.id} />
            <PublicClipsRow contentId={content.id} />
          </>
        )}

        <CommentsSection contentId={content.id} initialComments={comments} signedIn={viewer.signedIn} />
      </div>

      <div>
        <h2 className="kt-related-heading">Related</h2>
        {related.length === 0 ? (
          <p className="kt-page-subheading">No related content yet.</p>
        ) : (
          <div className="kt-related-list">
            {related.map((item) => (
              <Link key={item.id} href={`/kistube/watch/${item.id}`} className="kt-related-card">
                <div className="kt-related-thumb">
                  {item.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnail_url} alt="" />
                  ) : null}
                </div>
                <div>
                  <h3 className="kt-card-title">{item.title}</h3>
                  <div className="kt-card-meta">{item.channel.display_name}</div>
                  <div className="kt-card-meta">{formatRelativeTime(item.published_at)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
