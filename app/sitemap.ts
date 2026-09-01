import type { MetadataRoute } from "next";
import { products, supportArticles, updates, utilityRoutes, site } from "@/lib/site";
import { fetchWebsiteSitemapPlan } from "@/lib/website-builder-api";
import { fetchBroadcastSitemapPlan } from "@/lib/kistube-api";
import { kistubeIndexingEnabled } from "@/lib/kistube-metadata";

// The upstream URLs are "https://kis.app/channels/{handle}" and
// "https://kis.app/channels/{handle}/content/{id}" (see
// apps/broadcasts/views.py _public_channel_url/_public_content_url) - a
// different placeholder domain than this site, so only the trailing path
// segments are usable; this rebuilds them as this site's own canonical
// /kistube/channel/{handle} and /kistube/watch/{id} URLs.
function kistubeChannelPathFromUpstream(upstreamUrl: string): string | null {
  const match = upstreamUrl.match(/\/channels\/([^/]+)\/?$/);
  return match ? `/kistube/channel/${match[1]}` : null;
}
function kistubeWatchPathFromUpstream(upstreamUrl: string): string | null {
  const match = upstreamUrl.match(/\/channels\/[^/]+\/content\/([^/]+)\/?$/);
  return match ? `/kistube/watch/${match[1]}` : null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A hardcoded single date for every URL made `lastModified` meaningless
  // as a freshness signal - every entry claimed the same "last changed"
  // date forever, including on builds where nothing in that route changed.
  // `updates` entries have a real per-item date already; everywhere else
  // that has no genuine per-content timestamp, this uses the actual build
  // time instead of a stale fixed string - an honest "this reflects what
  // was live as of this build" signal, not a fabricated edit date.
  const buildDate = new Date();

  const core = ["/", "/about", "/mission", "/products", "/partners", "/investors", "/updates", "/contact", "/support", "/download"];

  const entries: MetadataRoute.Sitemap = [
    ...core.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: buildDate,
      changeFrequency: (route === "/" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: route === "/" ? 1 : 0.7,
    })),
    ...products.map((p) => ({
      url: `${site.url}/products/${p.slug}`,
      lastModified: buildDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...updates.map((u) => ({
      url: `${site.url}/updates/${u.slug}`,
      lastModified: new Date(u.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...supportArticles.map((a) => ({
      url: `${site.url}/support/${a.slug}`,
      lastModified: buildDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...utilityRoutes.map((r) => ({
      url: `${site.url}${r.href}`,
      lastModified: buildDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  // Website Builder pages - a genuinely dynamic set (owners publish from
  // inside the KIS app), fetched live rather than baked in like every
  // other entry above. Kept separate from broadcasts' own sitemap-plan
  // (kis.app, a different domain/concern) - see the website-builder plan.
  // Never lets a fetch failure break the whole sitemap.
  let websiteEntries: MetadataRoute.Sitemap = [];
  try {
    const plan = await fetchWebsiteSitemapPlan();
    if (plan?.indexing_enabled) {
      websiteEntries = (plan.sites ?? []).flatMap((s) => [
        {
          url: `${site.url}/page/${s.slug}`,
          lastModified: s.updated_at ? new Date(s.updated_at) : buildDate,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        },
        ...(s.pages ?? [])
          .filter((p) => p.slug && p.slug !== "home")
          .map((p) => ({
            url: `${site.url}/page/${s.slug}/${p.slug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : buildDate,
            changeFrequency: "weekly" as const,
            priority: 0.5,
          })),
      ]);
    }
  } catch (error) {
    console.error("sitemap: website-builder fetch failed", error);
  }

  // KISTube static section routes - always included (their own robots
  // meta already governs per-page indexing via kistubeRobots()); the
  // dynamic channel/content entries below are additionally gated on the
  // site-wide KISTube indexing flag AND the backend's own
  // indexing_enabled, matching kistubeIndexingEnabled()'s conservative
  // default-off stance until both sides explicitly opt in.
  const kistubeStatic = [
    "/kistube", "/kistube/education", "/kistube/health", "/kistube/market",
    "/kistube/jobs", "/kistube/feeds", "/kistube/testimonies", "/kistube/channels",
  ].map((route) => ({
    url: `${site.url}${route}`,
    lastModified: buildDate,
    changeFrequency: "daily" as const,
    priority: route === "/kistube" ? 0.8 : 0.6,
  }));

  let kistubeDynamicEntries: MetadataRoute.Sitemap = [];
  if (kistubeIndexingEnabled()) {
    try {
      const plan = await fetchBroadcastSitemapPlan();
      if (plan?.indexing_enabled) {
        const channelPaths = plan.channels.map(kistubeChannelPathFromUpstream).filter((p): p is string => !!p);
        const contentPaths = plan.contents.map(kistubeWatchPathFromUpstream).filter((p): p is string => !!p);
        kistubeDynamicEntries = [
          ...channelPaths.map((path) => ({ url: `${site.url}${path}`, lastModified: buildDate, changeFrequency: "weekly" as const, priority: 0.5 })),
          ...contentPaths.map((path) => ({ url: `${site.url}${path}`, lastModified: buildDate, changeFrequency: "weekly" as const, priority: 0.4 })),
        ];
      }
    } catch (error) {
      console.error("sitemap: broadcast sitemap-plan fetch failed", error);
    }
  }

  return [...entries, ...websiteEntries, ...kistubeStatic, ...kistubeDynamicEntries];
}
