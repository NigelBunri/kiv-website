import type { Metadata } from "next";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { ContentCard } from "@/components/kistube/ContentCard";
import type { ContentCard as ContentCardType } from "@/lib/kistube-api";
import { KISTubeAuthGate, KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { getKisTubeViewer } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Liked videos",
  description: "Videos you've liked on KISTube.",
  path: "/kistube/liked",
  robots: kistubeRobots(false),
});

type MyReactionRow = {
  id: string; title: string; thumbnail_url: string; content_type: string; duration_seconds: number | null;
  view_count: number; reaction: string; reacted_at: string | null;
  channel: { id: string; name: string; handle: string };
};

async function fetchMyReactions(): Promise<MyReactionRow[]> {
  const auth = await getValidSession();
  if (!auth) return [];
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/channel-contents/my-reactions/?limit=100`, {
      headers: authHeaders(auth.session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error("kistube liked: fetch failed", error);
    return [];
  }
}

function toContentCard(row: MyReactionRow): ContentCardType {
  return {
    id: row.id,
    title: row.title,
    content_type: row.content_type as ContentCardType["content_type"],
    thumbnail_url: row.thumbnail_url,
    duration_seconds: row.duration_seconds,
    published_at: row.reacted_at,
    channel: { id: row.channel.id, handle: row.channel.handle, display_name: row.channel.name },
    engagement_counts: { views: row.view_count, shares: 0, comments: 0, reactions: 0 },
  };
}

export default async function KISTubeLikedPage() {
  const { viewer } = await getKisTubeViewer();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">Liked videos</h1>
        <KISTubeAuthGate next="/kistube/liked" body="Sign in to see videos you've liked." />
      </div>
    );
  }

  const rows = await fetchMyReactions();

  return (
    <div>
      <h1 className="kt-page-heading">Liked videos</h1>
      <p className="kt-page-subheading">Videos and content you've reacted to on KISTube.</p>

      {rows.length === 0 ? (
        <KISTubeEmptyState title="Nothing liked yet" body="Videos you like while browsing KISTube will show up here." />
      ) : (
        <div className="kt-grid">
          {rows.map((row) => (
            <ContentCard key={row.id} content={toContentCard(row)} />
          ))}
        </div>
      )}
    </div>
  );
}
