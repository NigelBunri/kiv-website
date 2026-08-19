import Link from "next/link";
import type { WebsiteBuilderPage, WebsiteBuilderSite } from "@/lib/website-builder-api";
import { websiteBrandingStyle } from "@/lib/website-branding";
import { AnalyticsBeacon } from "./AnalyticsBeacon";
import { SectionRenderer } from "./SectionRenderer";

// Shared render body for both app/page/[siteSlug]/page.tsx (Home) and
// app/page/[siteSlug]/[pageSlug]/page.tsx (everything else) — same
// backend payload shape, same rendering, only the fetch call differs.
export function WebsitePageView({ site, page }: { site: WebsiteBuilderSite; page: WebsiteBuilderPage }) {
  const otherPages = site.pages.filter((p) => p.slug !== page.slug);
  const pageUrlSlug = page.is_home ? "home" : page.slug;
  return (
    <main className="wb-page" style={websiteBrandingStyle(site.branding)}>
      <AnalyticsBeacon siteSlug={site.slug} pageSlug={pageUrlSlug} />
      {otherPages.length > 0 && (
        <nav className="wb-nav" aria-label={`${site.name} pages`}>
          {otherPages.map((p) => (
            <Link key={p.slug} href={p.is_home ? `/page/${site.slug}` : `/page/${site.slug}/${p.slug}`}>
              {p.title}
            </Link>
          ))}
        </nav>
      )}
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} siteSlug={site.slug} pageSlug={pageUrlSlug} />
      ))}
    </main>
  );
}
