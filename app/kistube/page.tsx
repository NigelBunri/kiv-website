import Link from "next/link";
import { fetchChannelList, fetchMarketDiscovery, fetchTestimonies, searchBroadcastContent, type ContentCard as ContentCardType } from "@/lib/kistube-api";
import { ContentCard } from "@/components/kistube/ContentCard";
import { ChannelCard } from "@/components/kistube/ChannelCard";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import {
  ChannelsIcon, EducationIcon, FeedsIcon, HealthIcon, JobsIcon, MarketIcon, TestimoniesIcon,
} from "@/components/kistube/icons";

type RecommendedItem = ContentCardType & { recommendation_reason?: string };

// Real weighted-hybrid recommendations (subscription bonus + watch-time +
// engagement + recency) for signed-in users - direct Django fetch from
// this Server Component, not the /api/kistube/recommendations route
// (that route exists for potential client-side use elsewhere).
async function fetchHomeRecommendations(): Promise<RecommendedItem[]> {
  const auth = await getValidSession();
  if (!auth) return [];
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/recommendations/`, {
      headers: authHeaders(auth.session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error("kistube home: recommendations fetch failed", error);
    return [];
  }
}

const SECTIONS = [
  { href: "/kistube/education", label: "Education", Icon: EducationIcon, blurb: "Courses, lessons and events from KIS education institutions." },
  { href: "/kistube/health", label: "Health", Icon: HealthIcon, blurb: "Clinics and health institutions sharing their services." },
  { href: "/kistube/market", label: "Market", Icon: MarketIcon, blurb: "Trending products and services from KIS shops." },
  { href: "/kistube/jobs", label: "Jobs", Icon: JobsIcon, blurb: "Open roles posted across the KIS community." },
  { href: "/kistube/feeds", label: "Feeds", Icon: FeedsIcon, blurb: "Your personal, time-limited passive feed." },
  { href: "/kistube/testimonies", label: "Testimonies", Icon: TestimoniesIcon, blurb: "Real stories shared by the KIS community." },
  { href: "/kistube/channels", label: "Channels", Icon: ChannelsIcon, blurb: "Browse every public channel on KISTube." },
] as const;

export const revalidate = 0;

export default async function KISTubeHomePage() {
  const { viewer } = await getKisTubeSidebarData();
  const [latest, channels, market, testimonies, recommended] = await Promise.all([
    searchBroadcastContent({ q: "" }),
    fetchChannelList({ limit: 8 }),
    fetchMarketDiscovery(),
    fetchTestimonies({ limit: 6 }),
    viewer.signedIn ? fetchHomeRecommendations() : Promise.resolve([]),
  ]);

  const latestContent = latest?.results ?? [];
  const trendingProducts = market?.trending_products ?? [];

  return (
    <div>
      <h1 className="kt-page-heading">Welcome to KISTube</h1>
      <p className="kt-page-subheading">Watch with purpose — education, health, market, jobs, feeds and testimonies from the KIS community, all in one place.</p>

      <div className="kt-filter-row" aria-label="Sections">
        {SECTIONS.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="kt-filter-chip">
            <Icon /> {label}
          </Link>
        ))}
      </div>

      {viewer.signedIn && recommended.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 className="kt-related-heading">Recommended for you</h2>
          <div className="kt-grid">
            {recommended.slice(0, 12).map((content) => <ContentCard key={content.id} content={content} />)}
          </div>
        </section>
      )}

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className="kt-related-heading">Latest on KISTube</h2>
        {latestContent.length === 0 ? (
          <KISTubeEmptyState title="Nothing published yet" body="Channel content will show up here as soon as creators publish." />
        ) : (
          <div className="kt-grid">
            {latestContent.slice(0, 12).map((content) => <ContentCard key={content.id} content={content} />)}
          </div>
        )}
      </section>

      {channels && channels.results.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 className="kt-related-heading">Channels to follow</h2>
          <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {channels.results.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} signedIn={viewer.signedIn} />
            ))}
          </div>
        </section>
      )}

      {trendingProducts.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 className="kt-related-heading">Trending in Market</h2>
          <p className="kt-page-subheading" style={{ marginBottom: ".75rem" }}>
            <Link href="/kistube/market">See all Market activity →</Link>
          </p>
        </section>
      )}

      {testimonies?.results && testimonies.results.length > 0 && (
        <section>
          <h2 className="kt-related-heading">Recent testimonies</h2>
          <p className="kt-page-subheading" style={{ marginBottom: ".75rem" }}>
            {testimonies.results.length} shared recently. <Link href="/kistube/testimonies">Read testimonies →</Link>
          </p>
        </section>
      )}
    </div>
  );
}
