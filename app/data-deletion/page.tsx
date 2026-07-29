import { SiteShell } from "@/components/SiteShell";
import { PublicForm } from "@/components/PublicForm";
import { CardGrid, DetailList, ImageStory, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Data Deletion", description: "Request deletion or review of personal data handled by KIV/KIS.", path: "/data-deletion" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Data Deletion", href: "/data-deletion" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Data Deletion</h1>
          <p>Data deletion and review requests help visitors ask what personal data may be connected to the public website, KIS launch-list interest, support routes, partner enquiries, investor enquiries or future product accounts.</p>
          <p>KIV needs enough context to locate the relevant records and may require identity or ownership verification before taking action. That protects users and prevents unauthorized access or deletion.</p>
          <p>Some records may need to be retained where law, security, abuse prevention, dispute handling, audit trails or operational continuity require it.</p>
          <p>The website provides the public starting point. Product-specific workflows can be added later as KIS account systems and official availability states become public.</p>
        </article>
      </section>
      <ImageStory
        src="/images/kiv-trust-security-visual.jpg"
        alt="A data request workflow visual showing records, verification and privacy review."
        eyebrow="Data request path"
        title="The request should identify the record without exposing secrets."
        body="The safest data request gives context, keeps credentials private and allows KIV to verify ownership before action."
        points={[
          "Mention the form, product, email address or route connected to the request.",
          "Do not attach passwords, private messages, recovery codes or payment details.",
          "Expect retention exceptions where legal, security or audit requirements apply.",
        ]}
      />
      <Section title="What to include">
        <CardGrid
          items={[
            { title: "Record location", body: "Name the relevant route, form, launch list, product area or enquiry type if known." },
            { title: "Contact identity", body: "Use an email address that can help KIV verify ownership or request authority." },
            { title: "Request type", body: "State whether you want deletion, correction, access review or clarification." },
            { title: "No credentials", body: "Never send passwords, one-time codes, recovery phrases, private keys or unnecessary sensitive records." },
          ]}
        />
      </Section>
      <Section title="Your data rights" body="Drafted terms, pending legal review.">
        <DetailList
          items={[
            { title: "Right to erasure", body: "You can request deletion of personal data we hold about you, subject to legal retention exceptions." },
            { title: "Right to access", body: "You can ask what personal data we hold connected to your email address or a specific request." },
            { title: "Right to correction", body: "You can ask us to correct inaccurate personal data." },
            { title: "Verification", body: "We may ask for information to confirm you are the person the data belongs to, but never for passwords or account credentials." },
            { title: "Response time", body: "We aim to acknowledge requests within a reasonable period and complete verified requests within 30 days." },
            { title: "Exceptions", body: "Some data may be retained where law requires it, such as security-incident records, fraud-prevention records, or financial and audit records where applicable." },
          ]}
        />
      </Section>

      <section className="section">
        <div className="section-heading"><h2>Submit a request</h2><p>Use this form only for data-deletion or data-review help and never include passwords or private credentials.</p></div>
        <PublicForm kind="deletion" subject="Data Deletion request" />
      </section>
    </SiteShell>
  );
}
