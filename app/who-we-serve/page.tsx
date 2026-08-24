import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, ContactStrip, DetailList, Hero, Section, SegmentGrid } from "@/components/PageBlocks";
import { WebPageJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { audienceDeepDives, worldProblemsSolved } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Who We Serve",
  description: "The different people and organizations KIS serves, the real problems they face, and how KIS addresses them.",
  path: "/who-we-serve",
  image: { url: "/images/kiv-mission-visual-1200.jpg", width: 1200, height: 675, alt: "The mission and purpose guiding who KIS is built to serve." },
});

export default function WhoWeServePage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Who We Serve", href: "/who-we-serve" }]} />
      <WebPageJsonLd
        type="AboutPage"
        name="Who KIS serves"
        description="The different people and organizations KIS serves, the real problems they face, and how KIS addresses them."
        path="/who-we-serve"
      />
      <Hero
        eyebrow="Markets and mission"
        title="Six kinds of people. One trusted app built to actually serve them."
        body="Before KIS is a feature list, it's an answer to specific problems specific people already have. This page names the people, the real problems, and exactly how KIS addresses each one - with nothing claimed beyond what's already documented across the site."
        visual={{ src: "/images/kiv-mission-visual.jpg", alt: "The mission and purpose guiding who KIS is built to serve." }}
      />
      <Section
        title="Who KIS is built for"
        body="Each of these groups faces a different version of the same underlying gap: general-purpose platforms weren't built for them. Here's what changes with KIS."
      >
        <SegmentGrid items={audienceDeepDives} />
      </Section>
      <Section
        title="Real-world problems KIS is built to solve"
        body="Zoomed out from any one audience, these are the underlying problems the product exists to address - each tied to a specific, already-documented KIS capability."
      >
        <DetailList items={worldProblemsSolved} />
      </Section>
      <ContactStrip />
    </SiteShell>
  );
}
