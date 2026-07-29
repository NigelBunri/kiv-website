import { SiteShell } from "@/components/SiteShell";
import { CardGrid, ContactStrip, Hero, ProductGrid, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Kingdom Impact Ventures",
  description: "KIV builds business and technology ventures under KCAN, beginning with Kingdom Impact Social.",
  path: "/",
});

export default function HomePage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }]} />
      <Hero
        eyebrow="KCAN -> KIV -> KIS"
        title="Kingdom technology ventures built with clear purpose and responsible launch discipline."
        body="Kingdom Impact Ventures is the business and technology venture of KCAN. KIS is the first flagship product, with future education, media, payments and health ventures presented only at their configured stage."
        actions={[
          { href: "/products/kis", label: "View KIS", variant: "primary" },
          { href: "/download", label: "Check availability" },
        ]}
      />
      <Section title="Public hierarchy" body="The website keeps the organisation story consistent across every route.">
        <CardGrid
          items={[
            { title: "KCAN", body: "The parent organisation and mission body: Kingdom Citizens & Ambassadors Network." },
            { title: "KIV", body: "The business and technology venture responsible for product development and venture operations." },
            { title: "KIS", body: "The first flagship product, currently presented in advanced launch preparation." },
          ]}
        />
      </Section>
      <Section title="Venture portfolio" body="Every product page avoids unsupported launch, licensing, user-count or partner-logo claims.">
        <ProductGrid />
      </Section>
      <Section title="Production readiness" body="Deployment work covers public trust, accessibility, search visibility, secure forms and operational documentation.">
        <CardGrid
          items={[
            { title: "Trust and safety", body: "Clear acceptable-use, child-safety, security, email and deletion policies are available before launch.", href: "/trust" },
            { title: "Responsible forms", body: "Public forms include validation, honeypot protection, rate-limit scaffolding and honest delivery states.", href: "/contact" },
            { title: "Deployment handoff", body: "Vercel and AWS/self-hosted deployment paths are documented without changing any live server.", href: "/security" },
          ]}
        />
      </Section>
      <ContactStrip />
    </SiteShell>
  );
}
