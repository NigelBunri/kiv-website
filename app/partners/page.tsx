import { PublicForm } from "@/components/PublicForm";
import { SiteShell } from "@/components/SiteShell";
import { CardGrid, Hero, ImageStory, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Partners", description: "Partner with KIV as it prepares KIS and future KCAN-aligned ventures.", path: "/partners", image: { url: "/images/kiv-partners-visual-1200.jpg", width: 1200, height: 675, alt: "Partner workflows connecting KCAN institutions with KIV's product portfolio." } });

export default function PartnersPage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Partners", href: "/partners" }]} />
      <Hero eyebrow="Partners" title="Partner conversations for institutions, ministries and aligned teams." body="KIV welcomes serious partner conversations while avoiding fake logos, unsupported case studies or implied endorsements." />
      <ImageStory
        src="/images/kiv-partners-visual.jpg"
        alt="Partner organizations connected through a central KIV discovery and governance hub."
        eyebrow="Partner path"
        title="Partnership begins with discovery, fit and responsible implementation."
        body="The partner process is designed for ministries, institutions, creators and aligned teams that need clarity before public commitments."
        points={[
          "Discovery confirms the real workflow need.",
          "Governance fit comes before public claims.",
          "Implementation planning protects both KIV and partners.",
        ]}
      />
      <Section title="Partner areas">
        <CardGrid items={[
          { title: "Institution readiness", body: "Discuss community, education, market or operational workflows that may align with KIS or future ventures." },
          { title: "Governance fit", body: "KCAN/KIV alignment, safety expectations and operating responsibilities must be clear before public partnership claims." },
          { title: "Implementation path", body: "Partner work begins with discovery, not instant public claims or unreviewed commitments." },
        ]} />
      </Section>
      <Section title="Partnership request">
        <PublicForm kind="partner" subject="Partnership enquiry" />
      </Section>
    </SiteShell>
  );
}
