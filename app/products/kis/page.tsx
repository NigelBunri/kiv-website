import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { AvailabilityPanel, Breadcrumbs, ComparisonTable, DetailList, Hero, ImageStory, PillarGrid, PullQuote, Section, StatStrip, Timeline } from "@/components/PageBlocks";
import { ProductJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { kisComparisonColumns, kisComparisonRows, kisPillars, kisWhyBuilt, launchWorkflow, productBySlug, productDeepDives } from "@/lib/site";

const product = productBySlug("kis");

export const metadata = pageMetadata({
  title: product?.fullName ?? "Product",
  description: product?.summary ?? "KIV product page.",
  path: "/products/kis",
  image: { url: "/images/kis-ecosystem-visual-1200.jpg", width: 1200, height: 675, alt: "KIS shown as a unified app ecosystem." },
});

export default function ProductPage() {
  if (!product) notFound();
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Products", href: "/products" }, { name: product.name, href: "/products/kis" }]} />
      <ProductJsonLd product={product} />
      <Hero
        eyebrow={`${product.statusLabel} · KIV's flagship product`}
        title={product.fullName}
        body={product.summary}
        actions={[
          { href: "/download", label: "Check availability", variant: "primary" },
          { href: "/contact", label: "Contact KIV" },
        ]}
        logo={{ src: "/images/kis-logo.png", alt: product.fullName }}
      />
      <ImageStory
        src="/images/kis-ecosystem-visual.jpg"
        alt="KIS shown as a unified app ecosystem combining social feed, private messaging, Bible study, partner spaces and marketplace foundations."
        eyebrow="Product ecosystem"
        title="One trusted app space for communication, discipleship, partners and future commerce."
        body="KIS is designed as an integrated Christian digital ecosystem rather than a single-purpose social feed."
        points={[
          "Social connection and messaging sit beside Bible and study workflows.",
          "Partner and organisation spaces support community operations.",
          "Marketplace foundations are shown as early groundwork, not a public launch claim.",
        ]}
      />
      <Section
        title="Seven areas of life. One platform."
        body="Most digital tools serve one need at a time. KIS is architected to bring faith, family, learning, community governance, media, commerce and health together under a single account - each area described below as part of the product's designed scope."
      >
        <PillarGrid items={kisPillars} />
        <StatStrip
          items={[
            { value: "7", label: "Areas of life, unified" },
            { value: "1", label: "Account across all of them" },
            { value: "5", label: "Call types — voice, video, group, broadcast" },
            { value: "84+", label: "Product capabilities in the architecture" },
          ]}
        />
      </Section>
      <Section
        title="Why KIS is being built this way"
        body="Five forces shape the product's architecture - none of them claims about KIS's own current reach, all of them about the world it was designed to serve."
      >
        <DetailList items={kisWhyBuilt} />
      </Section>
      <Section
        title="KIS vs. the tools people already use"
        body="No single general-purpose app was designed to cover all of this. KIS's product architecture is - measured here against the categories of apps most communities already juggle."
      >
        <ComparisonTable columns={kisComparisonColumns} rows={kisComparisonRows} caption="Reflects the product's designed capability scope. See Availability below for what is actually released today." />
      </Section>
      <Section
        title="KISTube: watch the channels, broadcast and testimony module live"
        body="Unlike the rest of KIS, which stays deliberately careful about implying a broad public launch, KISTube is a real, public part of the product you can use today."
      >
        <p className="section-note">
          KISTube is the web home for KIS&apos;s Education, Health, Market, Jobs, Feeds, Testimonies and Channels
          content — browse channels, watch what partners and creators have published, and follow along, right
          from a browser. <Link href="https://kistube.kingdomimpactventures.org">Open KISTube →</Link>
        </p>
      </Section>
      <Section title="Product depth" body="This section explains what KIS is intended to become and where the public boundary remains today.">
        <DetailList items={productDeepDives.kis} />
      </Section>
      <Section title="Launch-readiness path" body="The product can be substantial while still requiring careful release controls.">
        <Timeline items={launchWorkflow} />
      </Section>
      <Section title="The vision behind KIS">
        <PullQuote
          quote="Our aim for KIS is to become a trusted digital home for Kingdom communities across many nations - uniting faith, family, education, governance, media, commerce and health into one purpose-driven platform, released responsibly rather than rushed."
          emphasis="trusted digital home for Kingdom communities across many nations"
          attribution="Nigel Bah — Founder & General Overseer, KCAN · Kingdom Impact Social"
        />
      </Section>
      <Section title="Responsible by design" body={product.details[2]}>
        <p className="section-note">
          KIS is presented here as a real product in advanced launch preparation - not as a fully public app.
          Store and web-app links only appear on this site once KIV configures the official, verified URLs, so
          nothing on this page implies availability that isn&apos;t there yet.
        </p>
      </Section>
      <AvailabilityPanel product={product} />
    </SiteShell>
  );
}
