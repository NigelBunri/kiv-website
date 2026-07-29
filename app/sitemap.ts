import type { MetadataRoute } from "next";
import { products, supportArticles, updates, utilityRoutes, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const core = ["/", "/about", "/mission", "/products", "/partners", "/investors", "/updates", "/contact", "/support", "/download"];
  const routes = [
    ...core,
    ...products.map((p) => `/products/${p.slug}`),
    ...updates.map((u) => `/updates/${u.slug}`),
    ...supportArticles.map((a) => `/support/${a.slug}`),
    ...utilityRoutes.map((r) => r.href),
  ];
  return routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date("2026-07-29"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
