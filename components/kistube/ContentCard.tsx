import Link from "next/link";
import type { ContentCard as ContentCardType } from "@/lib/kistube-api";
import { formatCount, formatDuration, formatRelativeTime } from "@/lib/kistube-format";

export function ContentCard({ content }: { content: ContentCardType }) {
  const isLive = content.content_type === "live_stream";
  const views = content.engagement_counts?.views;
  return (
    <Link href={`/kistube/watch/${content.id}`} className="kt-card">
      <div className="kt-card-thumb-wrap">
        {content.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={content.thumbnail_url} alt="" loading="lazy" />
        ) : (
          <div className="kt-card-thumb-placeholder">{content.channel.display_name}</div>
        )}
        {isLive && <span className="kt-card-live-badge">Live</span>}
        {!isLive && content.duration_seconds ? (
          <span className="kt-card-duration">{formatDuration(content.duration_seconds)}</span>
        ) : null}
      </div>
      <div className="kt-card-body">
        {content.channel.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={content.channel.avatar_url} alt="" className="kt-card-channel-avatar" />
        ) : (
          <span className="kt-card-channel-avatar" />
        )}
        <div>
          <h3 className="kt-card-title">{content.title}</h3>
          <div className="kt-card-meta">
            {content.channel.display_name}
            {content.channel.is_verified && <span className="kt-verified-badge">✓</span>}
          </div>
          <div className="kt-card-meta">
            {views !== undefined ? `${formatCount(views)} views` : null}
            {views !== undefined && content.published_at ? " · " : null}
            {formatRelativeTime(content.published_at)}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="kt-card">
      <div className="kt-card-thumb-wrap kt-skeleton" />
      <div className="kt-card-body">
        <span className="kt-card-channel-avatar kt-skeleton" />
        <div style={{ flex: 1 }}>
          <div className="kt-skeleton" style={{ height: 14, width: "90%", marginBottom: 6 }} />
          <div className="kt-skeleton" style={{ height: 12, width: "60%" }} />
        </div>
      </div>
    </div>
  );
}
