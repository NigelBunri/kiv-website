import { SiteShell } from "@/components/SiteShell";
import { CardGrid, DetailList, Hero, ImageStory, ProductGrid, Section, Timeline } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { launchWorkflow, products, ventureTimeline } from "@/lib/site";

export const metadata = pageMetadata({ title: "Products", description: "KIV product portfolio: KIS, KIE, KIM, KIP and KIH.", path: "/products" });

export default function ProductsPage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Products", href: "/products" }]} />
      <Hero eyebrow="Products" title="One flagship product in launch preparation, with future ventures clearly staged." body="KIS is KIV's first flagship product. KIE, KIM, KIP and KIH are future ventures and are not represented as launched products." />
      <ImageStory
        src="/images/kiv-portfolio-roadmap.jpg"
        alt="A staged KIV portfolio roadmap with KIS active first, followed by education, market, payments and health venture concepts."
        eyebrow="Portfolio roadmap"
        title="KIS leads first; the other ventures stay clearly staged."
        body="The portfolio is presented as a disciplined sequence, not a set of products already available to the public."
        points={[
          "KIS is the active flagship in launch preparation.",
          "KIE, KIM, KIP and KIH remain planned or research-stage.",
          "Future venture pages avoid release dates, user counts and licensing claims.",
        ]}
      />
      <Section title="Product portfolio" body="Each product page states its current stage and avoids unsupported claims.">
        <ProductGrid />
      </Section>
      <Section title="Current product-stage detail" body="Each venture has a different public status. The website keeps those differences visible.">
        <DetailList items={products.map((product) => ({ title: `${product.name}: ${product.statusLabel}`, body: `${product.summary} Audience: ${product.audience}` }))} />
      </Section>
      <Section title="Portfolio sequence" body="This sequence keeps the site honest about what comes first and what remains future-stage.">
        <Timeline items={ventureTimeline} />
      </Section>
      <Section title="How release claims are controlled" body="KIV does not use static copy to imply availability. Public actions depend on reviewed configuration and evidence.">
        <CardGrid items={launchWorkflow} />
      </Section>
    </SiteShell>
  );
}
