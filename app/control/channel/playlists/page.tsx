import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import PlaylistsWorkspace from "./PlaylistsWorkspace";

type Playlist = {
  id: string;
  title: string;
  description?: string;
  visibility: string;
  items?: { id: string; content: { id: string; title: string } }[];
};
type Content = { id: string; title: string };

export default async function ChannelPlaylistsPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const listRes = await fetch(`${kisApiBase()}/api/v1/broadcasts/channels/?mine=1`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  const listData = listRes.ok ? await listRes.json() : {};
  const channel = Array.isArray(listData?.results) ? listData.results[0] : null;
  if (!channel) notFound();

  const [playlistsRes, contentsRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channel.id)}/playlists/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channel.id)}/contents/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  const playlistsData = playlistsRes.ok ? await playlistsRes.json() : {};
  const playlists: Playlist[] = Array.isArray(playlistsData?.results) ? playlistsData.results : [];
  const contentsData = contentsRes.ok ? await contentsRes.json() : {};
  const contents: Content[] = Array.isArray(contentsData?.results) ? contentsData.results : [];

  return (
    <>
      <div className="control-header">
        <h1>Playlists</h1>
        <p>Group posts from {channel.display_name} into ordered playlists.</p>
      </div>
      <PlaylistsWorkspace channelId={channel.id} contents={contents} initialPlaylists={playlists} />
    </>
  );
}
