import type { WebsiteBuilderPage, WebsiteBuilderSite } from "@/lib/website-builder-api";
import { websiteBrandingStyle } from "@/lib/website-branding";
import { buildCourseJsonLd, buildOrganizationJsonLd, buildProductJsonLd, jsonLdSafeStringify } from "@/lib/structured-data";
import { AnalyticsBeacon } from "./AnalyticsBeacon";
import { SectionRenderer } from "./SectionRenderer";
import { WebsiteHeader } from "./WebsiteHeader";
import { WebsiteFooter } from "./WebsiteFooter";
import { PublicPromoBar } from "./PublicPromoBar";
import { CartProvider } from "./PublicCartProvider";
import { PublicCartDrawer } from "./PublicCartDrawer";

// Shared render body for both app/page/[siteSlug]/page.tsx (Home) and
// app/page/[siteSlug]/[pageSlug]/page.tsx (everything else) — same
// backend payload shape, same rendering, only the fetch call differs.
export function WebsitePageView({ site, page }: { site: WebsiteBuilderSite; page: WebsiteBuilderPage }) {
  const pageUrlSlug = page.is_home ? "home" : page.slug;

  // A leading promo_bar renders above the sticky header (the pattern
  // most ecommerce sites use — the bar scrolls away, the nav stays
  // pinned) instead of inline with the rest of the sections. Only the
  // FIRST section qualifies — a promo_bar anywhere else in the list
  // renders normally, in place, via SectionRenderer's regular dispatch.
  const leadingPromoBar = page.sections[0]?.type === "promo_bar" ? page.sections[0] : null;
  const bodySections = leadingPromoBar ? page.sections.slice(1) : page.sections;

  const itemJsonLd = page.sections
    .filter((s) => s.type === "kis_content")
    .flatMap((s) => {
      const targetType = String(s.data?.target_type || "");
      const items = s.resolved_items ?? [];
      if (targetType === "product") return items.map((item) => buildProductJsonLd(item, site.canonical_url));
      if (targetType === "course") return items.map((item) => buildCourseJsonLd(item, site.name));
      return [];
    })
    .filter((block): block is Record<string, unknown> => block !== null);

  const isShop = site.owner_type === "shop";

  const body = (
    <div className="wb-site" style={websiteBrandingStyle(site.branding)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(buildOrganizationJsonLd(site)) }} />
      {itemJsonLd.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(block) }} />
      ))}
      <AnalyticsBeacon siteSlug={site.slug} pageSlug={pageUrlSlug} />
      {leadingPromoBar ? <PublicPromoBar data={leadingPromoBar.data || {}} /> : null}
      <WebsiteHeader site={site} currentSlug={pageUrlSlug} />
      <main className="wb-page">
        {bodySections.map((section) => (
          <SectionRenderer key={section.id} section={section} siteSlug={site.slug} pageSlug={pageUrlSlug} />
        ))}
      </main>
      <WebsiteFooter site={site} />
      {isShop ? <PublicCartDrawer /> : null}
    </div>
  );

  return isShop ? <CartProvider shopId={site.owner_id}>{body}</CartProvider> : body;
}
