import { SiteShell } from "@/components/SiteShell";
import { CardGrid, ContactStrip, DetailList, HomeHero, ProductGrid, Section, Timeline } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { audienceSegments, launchWorkflow, operatingModel, ventureTimeline } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Kingdom Impact Ventures",
  description: "KIV builds business and technology ventures under KCAN, beginning with Kingdom Impact Social.",
  path: "/",
  image: { url: "/images/kiv-structure-visual-1200.jpg", width: 1200, height: 675, alt: "The structure connecting KCAN, KIV and its product portfolio." },
});

export default function HomePage() {
  return (
      <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }]} />
      <HomeHero />
      <Section title="How the organisation fits together" body="The project is easier to understand when the public structure is kept explicit.">
        <DetailList items={operatingModel} />
      </Section>
      <Section title="Public hierarchy" body="The website keeps the organisation story consistent across every route.">
        <CardGrid
          items={[
            {
              title: "KCAN",
              body: "The parent organisation and mission body: Kingdom Citizens & Ambassadors Network.",
              image: { src: "/images/sm/kcan-logo-sm.png", alt: "KCAN" },
            },
            {
              title: "KIV",
              body: "The business and technology venture responsible for product development and venture operations.",
              image: { src: "/images/sm/kiv-logo-sm.png", alt: "Kingdom Impact Ventures" },
            },
            {
              title: "KIS",
              body: "The first flagship product, currently presented in advanced launch preparation.",
              image: { src: "/images/sm/kis-logo-sm.png", alt: "Kingdom Impact Social" },
            },
          ]}
        />
      </Section>
      <Section title="Venture portfolio" body="Every product page avoids unsupported launch, licensing, user-count or partner-logo claims.">
        <ProductGrid />
      </Section>
      <Section title="Who the ecosystem is designed to serve" body="The long-term vision is broad, but each public statement remains tied to current product stage and review status.">
        <CardGrid items={audienceSegments} />
      </Section>
      <Section title="Launch discipline" body="KIV presents progress through a controlled workflow so users understand what exists, what is planned and what still requires review.">
        <Timeline items={launchWorkflow} />
      </Section>
      <Section title="Portfolio sequence" body="The wider KCAN/KIV plan grows in stages instead of presenting every venture as ready on day one.">
        <Timeline items={ventureTimeline} />
      </Section>
      <Section title="Production readiness" body="Deployment work covers public trust, accessibility, search visibility, secure forms and operational documentation.">
        <CardGrid
          items={[
            { title: "Trust and safety", body: "Clear acceptable-use, child-safety, security, email and deletion policies are available before launch.", href: "/trust" },
            { title: "Responsible forms", body: "Public forms include validation, honeypot protection, submission rate limiting and honest delivery states.", href: "/contact" },
            { title: "Deployment handoff", body: "Vercel and AWS/self-hosted deployment paths are documented without changing any live server.", href: "/security" },
          ]}
        />
      </Section>
      <ContactStrip />
    </SiteShell>
  );
}
