import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { fetchChannelPlaylistItems, fetchPublicUserPlaylist, type ContentCard as ContentCardType } from "@/lib/kistube-api";
import { ContentCard } from "@/components/kistube/ContentCard";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

type OwnerPlaylistItem = { id: string; content_id: string; sort_order: number; content: { id: string; title: string; content_type: string; thumbnail_url: string; duration_seconds: number | null; status: string } | null };
type OwnerPlaylist = { id: string; title: string; description: string; visibility: string; item_count: number; items: OwnerPlaylistItem[] };

// Owner-only fallback: covers a signed-in viewer looking at their own
// PRIVATE playlist, which the /public/ endpoint correctly rejects. Only
// reachable when the two public read paths above both 404.
async function fetchOwnerPlaylist(playlistId: string): Promise<OwnerPlaylist | null> {
  const auth = await getValidSession();
  if (!auth) return null;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/user-playlists/${encodeURIComponent(playlistId)}/`, {
      headers: authHeaders(auth.session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as OwnerPlaylist;
  } catch (error) {
    console.error("kistube playlist detail: owner fetch failed", error);
    return null;
  }
}

async function resolvePlaylist(id: string) {
  const userPlaylist = await fetchPublicUserPlaylist(id);
  if (userPlaylist) return { kind: "public" as const, data: userPlaylist };

  const channelPlaylist = await fetchChannelPlaylistItems(id);
  if (channelPlaylist) return { kind: "channel" as const, data: channelPlaylist };

  const ownerPlaylist = await fetchOwnerPlaylist(id);
  if (ownerPlaylist) return { kind: "owner" as const, data: ownerPlaylist };

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const resolved = await resolvePlaylist(id);
  const title = resolved
    ? resolved.kind === "channel"
      ? resolved.data.playlist.title
      : resolved.data.title
    : "Playlist";
  return kistubeMetadata({
    title,
    description: `${title} — a playlist on KISTube.`,
    path: `/kistube/playlist/${id}`,
    robots: kistubeRobots(false),
  });
}

function toContentCard(item: OwnerPlaylistItem): ContentCardType | null {
  if (!item.content) return null;
  return {
    id: item.content.id,
    title: item.content.title,
    content_type: item.content.content_type as ContentCardType["content_type"],
    thumbnail_url: item.content.thumbnail_url,
    duration_seconds: item.content.duration_seconds,
    published_at: null,
    channel: { id: "", handle: "", display_name: "" },
  };
}

export default async function KISTubePlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await resolvePlaylist(id);
  if (!resolved) notFound();

  let title: string;
  let description: string | undefined;
  let itemCount: number;
  let cards: ContentCardType[];

  if (resolved.kind === "channel") {
    title = resolved.data.playlist.title;
    description = resolved.data.playlist.description;
    cards = resolved.data.results;
    itemCount = cards.length;
  } else if (resolved.kind === "public") {
    title = resolved.data.title;
    description = resolved.data.description;
    cards = resolved.data.results;
    itemCount = resolved.data.item_count;
  } else {
    title = resolved.data.title;
    description = resolved.data.description;
    itemCount = resolved.data.item_count;
    cards = resolved.data.items.map(toContentCard).filter((c): c is ContentCardType => c !== null);
  }

  return (
    <div>
      <h1 className="kt-page-heading">{title}</h1>
      {description && <p className="kt-page-subheading">{description}</p>}
      <p className="kt-page-subheading" style={{ marginTop: description ? 0 : undefined }}>
        {itemCount} video{itemCount === 1 ? "" : "s"}
      </p>

      {cards.length === 0 ? (
        <KISTubeEmptyState title="Nothing here yet" body="Videos added to this playlist will show up here." />
      ) : (
        <div className="kt-grid">
          {cards.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      )}
    </div>
  );
}
