import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { AvailabilityPanel, Breadcrumbs, DetailList, FeatureGrid, Hero, ImageStory, Section, Timeline } from "@/components/PageBlocks";
import { ProductJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { kisModules, launchWorkflow, productBySlug, productDeepDives } from "@/lib/site";

const product = productBySlug("kis");

export const metadata = pageMetadata({
  title: product?.fullName ?? "Product",
  description: product?.summary ?? "KIV product page.",
  path: "/products/kis",
  image: { url: "/images/kis-ecosystem-visual-1200.jpg", width: 1200, height: 675, alt: "KIS shown as a unified app ecosystem." },
});

const features: Array<{ icon: "chat" | "broadcast" | "group" | "book" | "store" | "sliders"; title: string; body: string }> = [
  {
    icon: "chat",
    title: "Social connection",
    body: "Purpose-led profiles, groups and conversations built for KCAN communities to connect with intention, not just scroll.",
  },
  {
    icon: "broadcast",
    title: "Broadcast publishing",
    body: "Publish updates, teachings and announcements to exactly the people and partner spaces who need them.",
  },
  {
    icon: "group",
    title: "Partner spaces",
    body: "Dedicated spaces for ministry teams, educators and marketplace leaders to run their own communities inside KIS.",
  },
  {
    icon: "book",
    title: "Bible & study workflows",
    body: "Structured study and discipleship tools sit alongside social features as a first-class part of the app.",
  },
  {
    icon: "store",
    title: "Marketplace foundations",
    body: "Early groundwork for KCAN's wider commerce and partner ecosystem, built in from the start rather than bolted on.",
  },
  {
    icon: "sliders",
    title: "Configured availability",
    body: "Launch-list, Android, iOS and web actions only appear once official links are configured — nothing is implied ahead of readiness.",
  },
];

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
      <Section title="What KIS brings together" body={product.audience}>
        <FeatureGrid items={features} />
      </Section>
      <Section title="KIS module detail" body="KIS is designed as an ecosystem, so the public page now explains the major product areas instead of relying only on short cards.">
        <DetailList items={kisModules} />
      </Section>
      <Section title="Product depth" body="This section explains what KIS is intended to become and where the public boundary remains today.">
        <DetailList items={productDeepDives.kis} />
      </Section>
      <Section title="Launch-readiness path" body="The product can be substantial while still requiring careful release controls.">
        <Timeline items={launchWorkflow} />
      </Section>
      <Section title="Responsible by design" body={product.details[2]}>
        <p className="section-note">
          KIS is presented here as a real product in advanced launch preparation — not as a fully public app.
          Store and web-app links only appear on this site once KIV configures the official, verified URLs, so
          nothing on this page implies availability that isn&apos;t there yet.
        </p>
      </Section>
      <AvailabilityPanel product={product} />
    </SiteShell>
  );
}
