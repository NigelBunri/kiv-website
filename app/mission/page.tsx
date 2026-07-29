import { SiteShell } from "@/components/SiteShell";
import { CardGrid, Hero, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Mission", description: "The mission and operating principles behind KIV and its product portfolio.", path: "/mission" });

export default function MissionPage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Mission", href: "/mission" }]} />
      <Hero eyebrow="Mission" title="Build ventures that serve formation, connection and practical community infrastructure." body="KIV translates KCAN's mission into technology products while preserving legal, safety, privacy and operational review before each public launch." />
      <Section title="Operating principles">
        <CardGrid items={[
          { title: "Truthful launch posture", body: "No fake store links, fake partners, fake awards or unverified availability claims." },
          { title: "Safety by default", body: "Public forms, email flows and product claims are constrained until safeguards are verified." },
          { title: "Useful technology", body: "Products should support real communities, partners and discipleship workflows rather than abstract platform claims." },
        ]} />
      </Section>
    </SiteShell>
  );
}
