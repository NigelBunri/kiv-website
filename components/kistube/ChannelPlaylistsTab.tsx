import { PlaylistCard } from "@/components/kistube/PlaylistCard";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";

const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

type ChannelPlaylistRow = { id: string; title: string; visibility: string };

async function fetchChannelPlaylistsList(channelId: string): Promise<ChannelPlaylistRow[]> {
  try {
    const base = (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");
    const res = await fetch(`${base}/api/v1/broadcasts/channels/${encodeURIComponent(channelId)}/playlists/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data?.results) ? data.results : [];
  } catch {
    return [];
  }
}

// Server Component, self-contained - the coordinator drops
// <ChannelPlaylistsTab channelId={...} /> into the channel page's
// Playlists tab.
export async function ChannelPlaylistsTab({ channelId }: { channelId: string }) {
  const playlists = await fetchChannelPlaylistsList(channelId);
  if (playlists.length === 0) {
    return <KISTubeEmptyState title="No playlists yet" body="This channel hasn't published any playlists yet." />;
  }
  return (
    <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}
