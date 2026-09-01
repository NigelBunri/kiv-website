import type { Metadata } from "next";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { fetchPublicContent, type ContentCard as ContentCardType, type PublicContentPayload } from "@/lib/kistube-api";
import { ContentCard } from "@/components/kistube/ContentCard";
import { KISTubeAuthGate, KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { formatRelativeTime } from "@/lib/kistube-format";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "History",
  description: "Your recent watch history on KISTube.",
  path: "/kistube/history",
  robots: kistubeRobots(false),
});

type WatchHistoryRow = { content_id: string; progress_seconds: number; completed: boolean; last_viewed_at: string };

// Direct Django call, same reasoning as app/api/kistube/history/route.ts
// but called straight from this Server Component instead of through that
// route (avoids the self-referential HTTP round trip). Max 50 rows
// upstream, no title/thumbnail - hydrated below via fetchPublicContent().
async function fetchWatchHistory(): Promise<WatchHistoryRow[]> {
  const auth = await getValidSession();
  if (!auth) return [];
  const { session } = auth;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/watch-history/`, {
      headers: authHeaders(session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error("kistube history: fetch failed", error);
    return [];
  }
}

function toContentCard(content: PublicContentPayload): ContentCardType {
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    content_type: content.content_type,
    thumbnail_url: content.thumbnail_url,
    duration_seconds: content.asset?.duration_seconds ?? null,
    published_at: null,
    channel: {
      id: content.channel.id,
      handle: content.channel.handle,
      display_name: content.channel.display_name,
      avatar_url: content.channel.avatar_url,
    },
  };
}

export default async function KISTubeHistoryPage() {
  const { viewer } = await getKisTubeSidebarData();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">History</h1>
        <KISTubeAuthGate next="/kistube/history" body="Sign in to see your recent watch history." />
      </div>
    );
  }

  const rows = await fetchWatchHistory();
  const hydrated = (
    await Promise.all(
      rows.map(async (row) => {
        const content = await fetchPublicContent(row.content_id);
        return content ? { row, content } : null;
      }),
    )
  ).filter((entry): entry is { row: WatchHistoryRow; content: PublicContentPayload } => entry !== null);

  return (
    <div>
      <h1 className="kt-page-heading">History</h1>
      <p className="kt-page-subheading">Your recent watch history on KISTube.</p>

      {hydrated.length === 0 ? (
        <KISTubeEmptyState title="No watch history yet" body="Videos you watch on KISTube will show up here." />
      ) : (
        <div className="kt-grid">
          {hydrated.map(({ row, content }) => (
            <div key={content.id}>
              <ContentCard content={toContentCard(content)} />
              <div className="kt-card-meta" style={{ marginTop: "-.4rem" }}>
                {row.completed ? "Completed" : "Continue watching"} · {formatRelativeTime(row.last_viewed_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
