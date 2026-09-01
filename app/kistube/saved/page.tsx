import type { Metadata } from "next";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { fetchPublicContent, type ContentCard as ContentCardType, type PublicContentPayload } from "@/lib/kistube-api";
import { ContentCard } from "@/components/kistube/ContentCard";
import { KISTubeAuthGate, KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Saved",
  description: "Videos you've saved to watch later on KISTube.",
  path: "/kistube/saved",
  robots: kistubeRobots(false),
});

type WatchLaterItem = { id: string; content_id: string; sort_order: number; added_at: string };

// Mirrors app/api/kistube/watch-later/route.ts's ensure-then-fetch logic,
// called directly against Django rather than through that route (this is a
// Server Component - hitting our own Route Handler would be a
// self-referential HTTP round trip).
async function fetchWatchLaterItems(): Promise<WatchLaterItem[]> {
  const auth = await getValidSession();
  if (!auth) return [];
  const { session } = auth;
  const headers = { "Content-Type": "application/json", Accept: "application/json", ...authHeaders(session) };
  try {
    const ensure = await fetch(`${kisApiBase()}/api/v1/broadcasts/user-playlists/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title: "Watch Later", is_system: true, system_key: "watch_later" }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const playlist = await ensure.json().catch(() => ({}));
    if (!ensure.ok || !playlist?.id) return [];
    const itemsRes = await fetch(`${kisApiBase()}/api/v1/broadcasts/user-playlists/${playlist.id}/items/`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!itemsRes.ok) return [];
    const data = await itemsRes.json().catch(() => ({}));
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error("kistube saved: fetch failed", error);
    return [];
  }
}

// The playlist items API only carries content_id - hydrate each one via
// fetchPublicContent(), which already returns null gracefully for deleted
// content, then adapt the (differently-shaped) public content payload into
// the ContentCard grid shape.
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

export default async function KISTubeSavedPage() {
  const { viewer } = await getKisTubeSidebarData();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">Saved</h1>
        <KISTubeAuthGate next="/kistube/saved" body="Sign in to see videos you've saved to watch later." />
      </div>
    );
  }

  const items = await fetchWatchLaterItems();
  const hydrated = (await Promise.all(items.map((item) => fetchPublicContent(item.content_id))))
    .filter((content): content is PublicContentPayload => content !== null);

  return (
    <div>
      <h1 className="kt-page-heading">Saved</h1>
      <p className="kt-page-subheading">Videos you&apos;ve saved to watch later.</p>

      {hydrated.length === 0 ? (
        <KISTubeEmptyState title="Nothing saved yet" body="Save videos while browsing KISTube to find them here later." />
      ) : (
        <div className="kt-grid">
          {hydrated.map((content) => (
            <ContentCard key={content.id} content={toContentCard(content)} />
          ))}
        </div>
      )}
    </div>
  );
}
