import { SiteShell } from "@/components/SiteShell";
import { Hero, ProductGrid, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Products", description: "KIV product portfolio: KIS, KIE, KIM, KIP and KIH.", path: "/products" });

export default function ProductsPage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Products", href: "/products" }]} />
      <Hero eyebrow="Products" title="One flagship product in launch preparation, with future ventures clearly staged." body="KIS is KIV's first flagship product. KIE, KIM, KIP and KIH are future ventures and are not represented as launched products." />
      <Section title="Product portfolio" body="Each product page states its current stage and avoids unsupported claims.">
        <ProductGrid />
      </Section>
    </SiteShell>
  );
}
