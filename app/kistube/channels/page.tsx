import type { Metadata } from "next";
import { fetchChannelList, type ChannelOwnerType } from "@/lib/kistube-api";
import { ChannelCard } from "@/components/kistube/ChannelCard";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";
import Link from "next/link";
import { SearchIcon } from "@/components/kistube/icons";

export const metadata: Metadata = kistubeMetadata({
  title: "Channels",
  description: "Browse every public channel on KISTube.",
  path: "/kistube/channels",
  robots: kistubeRobots(),
});

const OWNER_TYPE_FILTERS: { value: ChannelOwnerType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "shop", label: "Market" },
  { value: "partner", label: "Partners" },
  { value: "user", label: "Community" },
];

export default async function KISTubeChannelsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;
  const { viewer } = await getKisTubeSidebarData();
  const ownerType = (type as ChannelOwnerType) || undefined;
  const channels = await fetchChannelList({ q, ownerType, limit: 48 });

  return (
    <div>
      <h1 className="kt-page-heading">Channels</h1>
      <p className="kt-page-subheading">Every public channel on KISTube — education institutions, health institutions, shops, partners and community creators.</p>

      <form className="kt-search-form" style={{ maxWidth: 420, marginBottom: "1.25rem" }} role="search">
        <input type="search" name="q" defaultValue={q} placeholder="Search channels" aria-label="Search channels" />
        {type && <input type="hidden" name="type" value={type} />}
        <button type="submit"><SearchIcon /></button>
      </form>

      <div className="kt-filter-row">
        {OWNER_TYPE_FILTERS.map((filter) => (
          <Link
            key={filter.value || "all"}
            href={`/kistube/channels${filter.value ? `?type=${filter.value}` : ""}`}
            className={`kt-filter-chip${(type || "") === filter.value ? " is-active" : ""}`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {!channels || channels.results.length === 0 ? (
        <KISTubeEmptyState title="No channels found" body="Try a different search or check back soon as more channels join KISTube." />
      ) : (
        <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {channels.results.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} signedIn={viewer.signedIn} />
          ))}
        </div>
      )}
    </div>
  );
}
