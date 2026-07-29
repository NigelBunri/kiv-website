import { PublicForm } from "@/components/PublicForm";
import { SiteShell } from "@/components/SiteShell";
import { CardGrid, Hero, ImageStory, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Contact", description: "Contact Kingdom Impact Ventures.", path: "/contact", image: { url: "/images/kiv-contact-workflows-visual-1200.jpg", width: 1200, height: 675, alt: "Contact request routing for Kingdom Impact Ventures." } });

export default function ContactPage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Contact", href: "/contact" }]} />
      <Hero eyebrow="Contact" title="Reach the correct KIV workflow." body="Use the public form for general enquiries. Do not submit passwords, recovery codes or confidential credentials." />
      <ImageStory
        src="/images/kiv-contact-workflows-visual.jpg"
        alt="A central KIV intake hub routing general, partner, investor, security and data requests into separate safe workflows."
        eyebrow="Request routing"
        title="Different requests need different handling paths."
        body="The website separates contact, partner, investor, security and deletion workflows so the right information reaches the right review path."
        points={[
          "General questions use the contact workflow.",
          "Sensitive issues such as security or deletion need purpose-specific forms.",
          "The site warns visitors not to submit credentials or private secrets.",
        ]}
      />
      <Section title="Direct addresses">
        <CardGrid items={[
          { title: "Support", body: site.supportEmail },
          { title: "Security", body: site.securityEmail },
          { title: "Legal", body: site.legalEmail },
        ]} />
      </Section>
      <Section title="Choose the safest route" body="Using the right path helps KIV respond without collecting unnecessary information.">
        <CardGrid items={[
          { title: "General enquiry", body: "Use the contact form for ordinary questions, website feedback or non-sensitive public enquiries." },
          { title: "Partner enquiry", body: "Use the partner form when the request involves institution, ministry, creator, education, market or operational collaboration." },
          { title: "Investor enquiry", body: "Use the investor form when the request involves diligence materials or funding conversations." },
          { title: "Security report", body: "Use the security form for vulnerabilities or abuse concerns, and do not include unrelated personal data." },
          { title: "Account or data request", body: "Use the deletion pages when the request concerns personal data or account-related handling." },
        ]} />
      </Section>
      <Section title="General contact form">
        <PublicForm kind="contact" subject="General enquiry" />
      </Section>
    </SiteShell>
  );
}
