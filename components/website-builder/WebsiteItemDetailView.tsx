import Link from "next/link";
import type { WebsiteBuilderKisContentDetail, WebsiteBuilderSite } from "@/lib/website-builder-api";
import { buildCourseJsonLd, buildOrganizationJsonLd, buildProductJsonLd, jsonLdSafeStringify } from "@/lib/structured-data";
import { websiteBrandingStyle } from "@/lib/website-branding";
import { WebsiteHeader } from "./WebsiteHeader";
import { WebsiteFooter } from "./WebsiteFooter";
import { BuyButton } from "./BuyButton";
import { OpenInApp } from "./OpenInApp";

const TARGET_TYPE_LABEL: Record<string, string> = {
  product: "Product",
  course: "Course",
  shop_service: "Service",
};

// The on-site counterpart to the app's own product/course/service detail
// screen — previously a website visitor clicking a kis-content card only
// ever got the app deep_link (dead end on desktop, no real information),
// with the card's 260-character blurb and single thumbnail as the only
// on-site information available. Reuses the same BuyButton/OpenInApp
// actions already proven on the card grid.
export function WebsiteItemDetailView({
  site, item, targetType,
}: { site: WebsiteBuilderSite; item: WebsiteBuilderKisContentDetail; targetType: string }) {
  const gallery = [item.image_url, ...(item.gallery || [])].filter(Boolean);
  const jsonLd = targetType === "product" ? buildProductJsonLd(item, site.canonical_url) : targetType === "course" ? buildCourseJsonLd(item, site.name) : null;

  return (
    <div className="wb-site" style={websiteBrandingStyle(site.branding)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(buildOrganizationJsonLd(site)) }} />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(jsonLd) }} />}
      <WebsiteHeader site={site} currentSlug="" />
      <main className="wb-page wb-item-detail">
        <Link href={`/page/${site.slug}`} className="wb-item-detail-back">← Back to {site.name}</Link>
        <div className="wb-item-detail-layout">
          <div className="wb-item-detail-media">
            {gallery.length > 0 ? (
              <>
                <img className="wb-item-detail-hero-image" src={gallery[0]} alt={item.title} />
                {gallery.length > 1 && (
                  <div className="wb-item-detail-gallery">
                    {gallery.slice(1).map((url, i) => (
                      <img key={i} src={url} alt={`${item.title} — ${i + 2}`} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="wb-item-detail-media-placeholder" aria-hidden="true" />
            )}
          </div>
          <div className="wb-item-detail-info">
            <span className="wb-item-detail-kicker">{TARGET_TYPE_LABEL[targetType] || "Item"}</span>
            <h1>{item.title}</h1>
            {item.price_display && (
              <p className="wb-item-detail-price">
                {item.price_display}
                {item.compare_at_price_display && <s className="wb-item-detail-compare-price">{item.compare_at_price_display}</s>}
              </p>
            )}
            {targetType === "product" && item.in_stock === false && <p className="wb-item-detail-stock wb-item-detail-stock--out">Out of stock</p>}
            {targetType === "course" && item.institution_name && <p className="wb-item-detail-meta">Offered by {item.institution_name}</p>}
            {targetType === "course" && item.duration_minutes ? <p className="wb-item-detail-meta">{item.duration_minutes} minutes</p> : null}
            {targetType === "shop_service" && item.quote_required && <p className="wb-item-detail-meta">Quote required — contact for pricing.</p>}
            {item.description && <p className="wb-item-detail-description">{item.description}</p>}
            {item.categories && item.categories.length > 0 && (
              <div className="wb-item-detail-tags">
                {item.categories.map((c) => <span key={c} className="wb-item-detail-tag">{c}</span>)}
              </div>
            )}
            <div className="wb-item-detail-actions">
              <BuyButton targetType={targetType} item={item} shopId={item.shop_id} />
              <OpenInApp deepLink={item.deep_link} />
            </div>
          </div>
        </div>
      </main>
      <WebsiteFooter site={site} />
    </div>
  );
}
