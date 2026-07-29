import { SiteShell } from "@/components/SiteShell";
import { CardGrid, ContactStrip, Hero, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About",
  description: "About Kingdom Impact Ventures, the business and technology venture of KCAN.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "About", href: "/about" }]} />
      <Hero eyebrow="About KIV" title="A venture structure for building technology with Kingdom accountability." body="KIV exists under KCAN to build, prepare and operate practical technology ventures with clear public claims and responsible launch gates." />
      <Section title="What KIV is responsible for">
        <CardGrid items={[
          { title: "Product development", body: "Building KIS and future ventures with native product, operational and support readiness." },
          { title: "Public accountability", body: "Keeping claims accurate, routes complete, forms safe and launch status clear." },
          { title: "Partner readiness", body: "Preparing workflows for partners, investors and support teams without overstating product availability." },
        ]} />
      </Section>
      <ContactStrip />
    </SiteShell>
  );
}
