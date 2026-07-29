import { PublicForm } from "@/components/PublicForm";
import { SiteShell } from "@/components/SiteShell";
import { CardGrid, Hero, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Contact", description: "Contact Kingdom Impact Ventures.", path: "/contact" });

export default function ContactPage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Contact", href: "/contact" }]} />
      <Hero eyebrow="Contact" title="Reach the correct KIV workflow." body="Use the public form for general enquiries. Do not submit passwords, recovery codes or confidential credentials." />
      <Section title="Direct addresses">
        <CardGrid items={[
          { title: "Support", body: site.supportEmail },
          { title: "Security", body: site.securityEmail },
          { title: "Legal", body: site.legalEmail },
        ]} />
      </Section>
      <Section title="General contact form">
        <PublicForm kind="contact" subject="General enquiry" />
      </Section>
    </SiteShell>
  );
}
