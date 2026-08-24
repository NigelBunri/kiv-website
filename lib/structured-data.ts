// schema.org JSON-LD for Website Builder public pages. Doesn't change
// whether a page gets indexed (that stays a deliberate, separate
// noindex-by-default stance - see lib/metadata.ts) but means the markup
// is already correct for the moment indexing is turned on, and some
// platforms/crawlers read JSON-LD independent of the meta robots tag.
import type { WebsiteBuilderKisContentItem, WebsiteBuilderSite } from "./website-builder-api";

const OWNER_TYPE_SCHEMA: Record<string, string> = {
  shop: "Store",
  health_institution: "MedicalBusiness",
  education_institution: "EducationalOrganization",
  partner: "NGO",
  broadcast_channel: "Organization",
};

export function buildOrganizationJsonLd(site: WebsiteBuilderSite): Record<string, unknown> {
  const branding = (site.branding as { palette?: { primary?: string } }) || {};
  return {
    "@context": "https://schema.org",
    "@type": OWNER_TYPE_SCHEMA[site.owner_type] || "Organization",
    name: site.name,
    url: site.canonical_url,
    ...(branding.palette?.primary ? { brand: { "@type": "Brand", name: site.name } } : {}),
  };
}

function parsePriceDisplay(priceDisplay: string): { amount: string; currency: string } | null {
  const parts = priceDisplay.trim().split(/\s+/);
  if (parts.length !== 2) return null;
  const [amountRaw, currencyRaw] = parts;
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!/^[A-Za-z]{3}$/.test(currencyRaw)) return null;
  return { amount: amountRaw, currency: currencyRaw.toUpperCase() };
}

export function buildProductJsonLd(item: WebsiteBuilderKisContentItem, siteUrl: string): Record<string, unknown> | null {
  const price = parsePriceDisplay(item.price_display || "");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    description: item.description || undefined,
    image: item.image_url || undefined,
    url: siteUrl,
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            price: price.amount,
            priceCurrency: price.currency,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function buildCourseJsonLd(item: WebsiteBuilderKisContentItem, providerName: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: item.title,
    description: item.description || undefined,
    provider: { "@type": "Organization", name: providerName },
  };
}

/** JSON.stringify doesn't escape `<`, so a title/description containing
 * `</script>` could break out of the JSON-LD <script> tag it's rendered
 * into. Standard JSON-LD-in-HTML mitigation: escape `<` to its unicode
 * form, which round-trips through JSON.parse identically. */
export function jsonLdSafeStringify(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
