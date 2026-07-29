import { SiteShell } from "@/components/SiteShell";
import { CardGrid, ContactStrip, DetailList, Hero, Section, Timeline } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { operatingModel, trustSafeguards, ventureTimeline } from "@/lib/site";

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
      <Section title="Operating model" body="KIV is not a disconnected product label. It is the venture arm that translates KCAN-aligned purpose into practical technology and operating systems.">
        <DetailList items={operatingModel} />
      </Section>
      <Section title="What KIV is responsible for">
        <CardGrid items={[
          { title: "Product development", body: "Building KIS and future ventures with native product, operational and support readiness." },
          { title: "Public accountability", body: "Keeping claims accurate, routes complete, forms safe and launch status clear." },
          { title: "Partner readiness", body: "Preparing workflows for partners, investors and support teams without overstating product availability." },
        ]} />
      </Section>
      <Section title="How KIV protects clarity" body="The website has to help people understand the project without overstating what has not yet been reviewed.">
        <CardGrid items={trustSafeguards.slice(0, 4)} />
      </Section>
      <Section title="Longer-term venture path" body="KIS comes first. Future ventures stay staged until they can be explained with evidence and proper operating readiness.">
        <Timeline items={ventureTimeline} />
      </Section>
      <Section title="Part of KCAN" body="KIV is one initiative under KCAN, alongside other independently operated efforts.">
        <CardGrid items={[
          {
            title: "KIV",
            body: "This site: the business and technology venture responsible for KIS and KIV's future product portfolio.",
            image: { src: "/images/sm/kiv-logo-sm.png", alt: "Kingdom Impact Ventures" },
          },
          {
            title: "Shekinah Global",
            body: "A separate initiative under KCAN, run independently of KIV. It is not a KIV product and isn't covered by this site's product pages or launch documentation.",
            image: { src: "/images/sm/shekina-global-logo-sm.png", alt: "Shekinah Global" },
          },
        ]} />
      </Section>
      <ContactStrip />
    </SiteShell>
  );
}
