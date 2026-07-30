import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, CardGrid, DetailList, Hero, ImageStory, Section, Timeline } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";
import { launchWorkflow, trustSafeguards, ventureTimeline } from "@/lib/site";

export const metadata = pageMetadata({ title: "Mission", description: "The mission and operating principles behind KIV and its product portfolio.", path: "/mission", image: { url: "/images/kiv-mission-visual-1200.jpg", width: 1200, height: 675, alt: "The mission and operating principles guiding KIV's product portfolio." } });

export default function MissionPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Mission", href: "/mission" }]} />
      <Hero eyebrow="Mission" title="Build ventures that serve formation, connection and practical community infrastructure." body="KIV translates KCAN's mission into technology products while preserving legal, safety, privacy and operational review before each public launch." />
      <ImageStory
        src="/images/kiv-mission-visual.jpg"
        alt="A mission compass connecting reviewed community, education, market, payments and health venture modules."
        eyebrow="Mission to ventures"
        title="Purpose becomes useful technology through disciplined review."
        body="KIV's role is to translate KCAN's purpose into practical products without skipping safety, legal, privacy or operational gates."
        points={[
          "Mission defines the direction.",
          "Technology modules serve real community needs.",
          "Review gates protect users before public launch.",
        ]}
      />
      <Section title="Operating principles">
        <CardGrid items={[
          { title: "Truthful launch posture", body: "No fake store links, fake partners, fake awards or unverified availability claims." },
          { title: "Safety by default", body: "Public forms, email flows and product claims are constrained until safeguards are verified." },
          { title: "Useful technology", body: "Products should support real communities, partners and discipleship workflows rather than abstract platform claims." },
        ]} />
      </Section>
      <Section title="Responsible launch workflow" body="The mission is practical, but KIV does not treat every idea as a public product before it is ready.">
        <Timeline items={launchWorkflow} />
      </Section>
      <Section title="Safeguards that shape public communication" body="These safeguards keep the public site useful while avoiding unsupported claims.">
        <DetailList items={trustSafeguards} />
      </Section>
      <Section title="Mission growth path" body="The wider vision moves from social connection into education, market, payments and health only through staged review.">
        <Timeline items={ventureTimeline} />
      </Section>
    </SiteShell>
  );
}
