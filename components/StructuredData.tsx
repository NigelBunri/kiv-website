import { absoluteUrl, Product, site } from "@/lib/site";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.name,
        alternateName: site.shortName,
        url: site.url,
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
  return <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.url }} />;
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
        publisher: { "@type": "Organization", name: site.name, url: site.url },
      }}
    />
  );
}
