import { PublicForm } from "@/components/PublicForm";
import { SiteShell } from "@/components/SiteShell";
import { CardGrid, Hero, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Investors", description: "Investor information for Kingdom Impact Ventures without unsupported claims or unverified metrics.", path: "/investors" });

export default function InvestorsPage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Investors", href: "/investors" }]} />
      <Hero eyebrow="Investors" title="A disciplined venture portfolio beginning with KIS." body="This page provides a compliant public overview. Detailed investment materials require direct review and should not be treated as an offer from this website." />
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
