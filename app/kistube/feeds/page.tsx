import type { Metadata } from "next";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { KISTubeAuthGate, KISTubeErrorState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";
import { formatRelativeTime } from "@/lib/kistube-format";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Feeds",
  description: "Your personal, time-limited passive feed from KISTube.",
  path: "/kistube/feeds",
  robots: kistubeRobots(),
});

// BroadcastFeedView (apps.broadcasts) is IsAuthenticated and enforces the
// real 2h/day responsible-engagement limit server-side. Once the daily cap
// is hit it still returns 200 with {results: [], feed_limit: {...,
// limit_reached: true}} — not an error. Items are a large polymorphic
// multi-source feed (market products, education broadcasts, channel
// content, community posts) not traced field-by-field, so each item is
// rendered defensively as an unknown record.
type FeedLimit = { seconds_consumed: number; limit_seconds: number; seconds_remaining: number; limit_reached: boolean };
type FeedResponse = { results: Record<string, unknown>[]; count: number; next: string | null; previous: string | null; feed_limit?: FeedLimit };

async function fetchFeed(): Promise<FeedResponse | null | "error"> {
  const auth = await getValidSession();
  if (!auth) return null;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/`, {
      headers: authHeaders(auth.session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return "error";
    return (await res.json()) as FeedResponse;
  } catch (error) {
    console.error("kistube feeds: feed fetch failed", error);
    return "error";
  }
}

function formatMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function FeedItemTile({ item }: { item: Record<string, unknown> }) {
  const title = str(item.title) ?? str(item.name) ?? "Untitled";
  const image = str(item.thumbnail_url) ?? str(item.image_url) ?? str(item.cover_url) ?? str(item.coverUrl);
  const sourceType = str(item.source_type);
  const timestamp = str(item.published_at) ?? str(item.broadcasted_at) ?? str(item.created_at);

  return (
    <div className="kt-card" style={{ cursor: "default" }}>
      <div className="kt-card-thumb-wrap">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" loading="lazy" />
        ) : (
          <div className="kt-card-thumb-placeholder">{title}</div>
        )}
      </div>
      <div className="kt-card-body">
        <div style={{ flex: 1 }}>
          <h3 className="kt-card-title">{title}</h3>
          <div className="kt-card-meta" style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
            {sourceType && (
              <span className="kt-filter-chip" style={{ cursor: "default", padding: ".1rem .55rem", fontSize: ".72rem" }}>
                {sourceType}
              </span>
            )}
            {timestamp && formatRelativeTime(timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function KISTubeFeedsPage() {
  const { viewer, feedStatus } = await getKisTubeSidebarData();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">Feeds</h1>
        <p className="kt-page-subheading">Your personal, time-limited passive feed.</p>
        <KISTubeAuthGate next="/kistube/feeds" body="Sign in to see your personal feed and daily watch-time." />
      </div>
    );
  }

  const feed = await fetchFeed();
  const limitReached = feedStatus?.limit_reached || (feed !== "error" && feed?.feed_limit?.limit_reached) || false;

  return (
    <div>
      <h1 className="kt-page-heading">Feeds</h1>
      <p className="kt-page-subheading">Your personal, time-limited passive feed — built for responsible engagement, not endless scroll.</p>

      {feedStatus && (
        <div
          className="kt-watchtime"
          style={{ margin: "0 0 1.75rem", maxWidth: 480 }}
        >
          <div className="kt-watchtime-heading">Today&rsquo;s watch time</div>
          <div className="kt-watchtime-row">
            <span>Used</span>
            <strong>{formatMinutes(feedStatus.seconds_consumed)}</strong>
          </div>
          <div className="kt-watchtime-bar">
            <div
              className={`kt-watchtime-bar-fill${feedStatus.limit_reached ? " is-limit-reached" : ""}`}
              style={{ width: `${Math.min(100, (feedStatus.seconds_consumed / Math.max(1, feedStatus.limit_seconds)) * 100)}%` }}
            />
          </div>
          <div className="kt-watchtime-reset">
            {feedStatus.limit_reached
              ? "Daily limit reached — thanks for watching with purpose today."
              : `${formatMinutes(feedStatus.seconds_remaining)} left of your ${formatMinutes(feedStatus.limit_seconds)} daily limit`}
          </div>
        </div>
      )}

      {feed === "error" && (
        <KISTubeErrorState body="Unable to load your feed right now. Please try again shortly." />
      )}

      {feed && feed !== "error" && limitReached && (
        <div className="kt-state">
          <div className="kt-state-title">You&rsquo;ve reached today&rsquo;s limit</div>
          <div className="kt-state-body">You&rsquo;ve reached your daily watch-time limit. Thanks for watching with purpose — more tomorrow.</div>
        </div>
      )}

      {feed && feed !== "error" && !limitReached && (
        feed.results.length === 0 ? (
          <div className="kt-state">
            <div className="kt-state-title">Your feed is empty right now</div>
            <div className="kt-state-body">Subscribe to channels and check back soon — new content will appear here.</div>
          </div>
        ) : (
          <div className="kt-grid">
            {feed.results.map((item, index) => (
              <FeedItemTile key={str(item.id) ?? index} item={item} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
