import { absoluteUrl, Product, site } from "@/lib/site";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function OrganizationJsonLd() {
  const logo = absoluteUrl("/images/kiv-logo-512.png");
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        alternateName: site.shortName,
        url: site.url,
        logo: { "@type": "ImageObject", url: logo, width: 512, height: 512 },
        image: logo,
        description: site.description,
        email: site.supportEmail,
        // areaServed/knowsAbout reflect what the homepage and product pages
        // actually say (the "4 Pillars" / "Many Nations" stats and product
        // summaries) — not an invented keyword list. Don't add sameAs,
        // founder or foundingDate here without a real, live URL/date to
        // back them: unverifiable Organization claims are exactly what
        // Google's structured-data spam guidance flags, and a broken/fake
        // sameAs link actively hurts Knowledge Graph confidence rather than
        // helping it.
        areaServed: "Worldwide",
        knowsAbout: ["Christian technology ventures", "Kingdom-aligned digital products", "Education technology", "Marketplace platforms", "Digital payments", "Community and social platforms"],
        brand: { "@type": "Brand", name: site.name },
        publishingPrinciples: absoluteUrl("/trust"),
        parentOrganization: {
          "@type": "Organization",
          name: site.parentName,
        },
        contactPoint: [
          { "@type": "ContactPoint", contactType: "support", email: site.supportEmail },
          { "@type": "ContactPoint", contactType: "security", email: site.securityEmail },
        ],
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        alternateName: site.shortName,
        url: site.url,
        description: site.description,
        publisher: { "@id": `${site.url}/#organization` },
        inLanguage: "en-US",
        // No SearchAction/sitelinks-searchbox: the site has no working
        // search results route to point it at. Adding one without a real
        // endpoint behind it is the kind of unverifiable markup Google's
        // structured-data guidelines flag — see the deployment report.
      }}
    />
  );
}

/** WebPage-level typing for pages with a recognized schema.org WebPage
 * subtype. Generic pages (most of the site) don't need this — Google
 * doesn't require WebPage markup on every page, and adding it everywhere
 * with no distinguishing type is low-value markup bloat. Use this only for
 * pages with a real subtype: "AboutPage", "ContactPage", or plain
 * "WebPage" for the couple of legal pages that don't have a truer
 * schema.org fit ("PrivacyPolicy"/"TermsOfService" are not real schema.org
 * types, despite showing up in some checklists — using them would fail
 * validation). */
export function WebPageJsonLd({
  type = "WebPage",
  name,
  description,
  path,
}: {
  type?: "WebPage" | "AboutPage" | "ContactPage";
  name: string;
  description: string;
  path: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": type,
        name,
        description,
        url: absoluteUrl(path),
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#organization` },
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: absoluteUrl(path),
        datePublished,
        dateModified: dateModified ?? datePublished,
        author: { "@id": `${site.url}/#organization` },
        publisher: { "@id": `${site.url}/#organization` },
        mainEntityOfPage: absoluteUrl(path),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; href: string }> }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.href),
        })),
      }}
    />
  );
}

export function ProductJsonLd({ product }: { product: Product }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: product.fullName,
        alternateName: product.name,
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Android, iOS, Web",
        description: product.summary,
        url: absoluteUrl(`/products/${product.slug}`),
        image: absoluteUrl(`/images/${product.slug}-logo-512.png`),
        // No offers/aggregateRating: this product has no real price or
        // review data to publish. Fabricating either is the single most
        // common cause of a manual "structured data" spam action.
        publisher: { "@id": `${site.url}/#organization` },
        isPartOf: { "@id": `${site.url}/#website` },
      }}
    />
  );
}
