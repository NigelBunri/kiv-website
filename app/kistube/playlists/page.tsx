import type { Metadata } from "next";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { PlaylistCard, type PlaylistSummary } from "@/components/kistube/PlaylistCard";
import { CreatePlaylistForm } from "@/components/kistube/CreatePlaylistForm";
import { KISTubeAuthGate, KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { getKisTubeViewer } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Your Playlists",
  description: "Playlists you've created on KISTube.",
  path: "/kistube/playlists",
  robots: kistubeRobots(false),
});

async function fetchMyPlaylists(): Promise<PlaylistSummary[]> {
  const auth = await getValidSession();
  if (!auth) return [];
  const { session } = auth;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/user-playlists/`, {
      headers: authHeaders(session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error("kistube playlists: fetch failed", error);
    return [];
  }
}

export default async function KISTubePlaylistsPage() {
  const { viewer } = await getKisTubeViewer();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">Your Playlists</h1>
        <KISTubeAuthGate next="/kistube/playlists" body="Sign in to create and manage playlists." />
      </div>
    );
  }

  const playlists = await fetchMyPlaylists();

  return (
    <div>
      <h1 className="kt-page-heading">Your Playlists</h1>
      <p className="kt-page-subheading">Organize videos you want to watch, together.</p>

      <CreatePlaylistForm />

      {playlists.length === 0 ? (
        <KISTubeEmptyState title="No playlists yet" body="Create your first playlist above, or save a video to a new playlist from its watch page." />
      ) : (
        <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}
