import type { MetadataRoute } from "next";
import { products, supportArticles, updates, utilityRoutes, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // A hardcoded single date for every URL made `lastModified` meaningless
  // as a freshness signal — every entry claimed the same "last changed"
  // date forever, including on builds where nothing in that route changed.
  // `updates` entries have a real per-item date already; everywhere else
  // that has no genuine per-content timestamp, this uses the actual build
  // time instead of a stale fixed string — an honest "this reflects what
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

  return entries;
}
