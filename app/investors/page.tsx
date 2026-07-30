import { PublicForm } from "@/components/PublicForm";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, CardGrid, Hero, ImageStory, Section } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Investors", description: "Investor information for Kingdom Impact Ventures without unsupported claims or unverified metrics.", path: "/investors", image: { url: "/images/kiv-investors-visual-1200.jpg", width: 1200, height: 675, alt: "Investor information for Kingdom Impact Ventures." } });

export default function InvestorsPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Investors", href: "/investors" }]} />
      <Hero eyebrow="Investors" title="A disciplined venture portfolio beginning with KIS." body="This page provides a compliant public overview. Detailed investment materials require direct review and should not be treated as an offer from this website." />
      <ImageStory
        src="/images/kiv-investors-visual.jpg"
        alt="A disciplined investor-readiness scene with a protected KIS pillar, staged portfolio pillars, diligence folders and validation checkpoints."
        eyebrow="Readiness posture"
        title="Investor conversations should be evidence-led, not hype-led."
        body="The public site gives a compliant overview while detailed materials remain part of a direct due-diligence process."
        points={[
          "KIS is the first product under review for launch readiness.",
          "Future ventures remain staged behind clear evidence gates.",
          "Public copy avoids fake traction, revenue or valuation claims.",
        ]}
      />
      <Section title="Investor posture">
        <CardGrid items={[
          { title: "No placeholder metrics", body: "The public website does not publish fake users, revenue, awards or partner counts." },
          { title: "Product-stage clarity", body: "KIS is in advanced launch preparation. Future products are planned or research-stage." },
          { title: "Due diligence path", body: "Investor conversations can request product, legal, operational and launch-readiness evidence." },
        ]} />
      </Section>
      <Section title="Investor enquiry">
        <PublicForm kind="investor" subject="Investor enquiry" />
      </Section>
    </SiteShell>
  );
}
