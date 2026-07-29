import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { AvailabilityPanel, CardGrid, Hero, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { productBySlug } from "@/lib/site";

const product = productBySlug("kip");

export const metadata = pageMetadata({
  title: product?.fullName ?? "Product",
  description: product?.summary ?? "KIV product page.",
  path: "/products/kip",
});

export default function ProductPage() {
  if (!product) notFound();
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Products", href: "/products" }, { name: product.name, href: "/products/kip" }]} />
      <ProductJsonLd product={product} />
      <Hero eyebrow={product.statusLabel} title={product.fullName} body={product.summary} actions={[{ href: "/download", label: "Availability", variant: "primary" }, { href: "/contact", label: "Contact KIV" }]} />
      <Section title="Who this is for" body={product.audience}>
        <CardGrid items={product.details.map((body, index) => ({ title: `Readiness note ${index + 1}`, body }))} />
      </Section>
      <AvailabilityPanel product={product} />
    </SiteShell>
  );
}
