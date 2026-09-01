import Link from "next/link";
import { ChannelsIcon } from "@/components/kistube/icons";

export type PlaylistSummary = {
  id: string;
  title: string;
  item_count?: number;
  visibility?: string;
};

export function PlaylistCard({ playlist }: { playlist: PlaylistSummary }) {
  return (
    <Link href={`/kistube/playlist/${playlist.id}`} className="kt-channel-card">
      <span
        className="kt-channel-card-avatar"
        style={{ width: 72, height: 72, display: "grid", placeItems: "center", background: "var(--gold-soft)" }}
      >
        <ChannelsIcon />
      </span>
      <span className="kt-channel-card-name">{playlist.title}</span>
      <span className="kt-channel-card-meta">
        {playlist.item_count ?? 0} video{(playlist.item_count ?? 0) === 1 ? "" : "s"}
        {playlist.visibility && playlist.visibility !== "public" ? ` · ${playlist.visibility}` : ""}
      </span>
    </Link>
  );
}
