import Link from "next/link";
import { fetchChannelShelves, fetchPublicContent, fetchShelfItems } from "@/lib/kistube-api";
import { ContentCard } from "@/components/kistube/ContentCard";

// Server Component, self-contained - curated homepage rows for a channel
// (YouTube-style "Featured playlists" / "Popular uploads" shelves).
// ChannelHomepageShelfItemSerializer only exposes raw content/playlist
// FK ids, not hydrated titles/thumbnails, so content items are hydrated
// via fetchPublicContent() in parallel (same pattern as Saved/History
// pages); playlist items render as a plain link since hydrating each
// would mean a second full-detail fetch per item for a shelf that's
// currently empty on every channel (no channel has created one yet).
export async function ChannelShelves({ channelId }: { channelId: string }) {
  const shelves = await fetchChannelShelves(channelId);
  if (shelves.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {shelves.map((shelf) => <ShelfRow key={shelf.id} shelfId={shelf.id} title={shelf.title} />)}
    </div>
  );
}

async function ShelfRow({ shelfId, title }: { shelfId: string; title: string }) {
  const items = await fetchShelfItems(shelfId);
  if (items.length === 0) return null;

  const contentItems = items.filter((item) => item.content);
  const playlistItems = items.filter((item) => item.playlist);
  const hydratedContent = (await Promise.all(contentItems.map((item) => fetchPublicContent(item.content!))))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (hydratedContent.length === 0 && playlistItems.length === 0) return null;

  return (
    <div>
      <h2 className="kt-related-heading">{title}</h2>
      <div className="kt-grid">
        {hydratedContent.map((content) => (
          <ContentCard
            key={content.id}
            content={{
              id: content.id,
              title: content.title,
              content_type: content.content_type,
              thumbnail_url: content.thumbnail_url,
              duration_seconds: content.asset?.duration_seconds ?? null,
              published_at: null,
              channel: { id: content.channel.id, handle: content.channel.handle, display_name: content.channel.display_name, avatar_url: content.channel.avatar_url },
            }}
          />
        ))}
        {playlistItems.map((item) => (
          <Link key={item.id} href={`/kistube/playlist/${item.playlist}`} className="kt-channel-card">
            <span className="kt-channel-card-name">View playlist</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
