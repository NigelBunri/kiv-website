import type { Metadata } from "next";
import { fetchTrending, trendingItemToContentCard } from "@/lib/kistube-api";
import { ContentCard } from "@/components/kistube/ContentCard";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Trending",
  description: "What's trending on KISTube right now, ranked by real engagement over the last week.",
  path: "/kistube/trending",
  robots: kistubeRobots(),
});

export default async function KISTubeTrendingPage() {
  const trending = await fetchTrending({ days: 7, limit: 48 });
  const items = trending?.results ?? [];

  return (
    <div>
      <h1 className="kt-page-heading">Trending</h1>
      <p className="kt-page-subheading">Ranked by views, reactions, comments and shares from the last 7 days — not just newest first.</p>

      {items.length === 0 ? (
        <KISTubeEmptyState title="Nothing trending yet" body="Check back soon as more channels publish content on KISTube." />
      ) : (
        <div className="kt-grid">
          {items.map((item) => (
            <ContentCard key={item.id} content={trendingItemToContentCard(item)} />
          ))}
        </div>
      )}
    </div>
  );
}
