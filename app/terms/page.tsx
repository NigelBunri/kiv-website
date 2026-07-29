import { CardGrid, DetailList, Section } from "@/components/PageBlocks";
import { SiteShell } from "@/components/SiteShell";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Terms", description: "Terms for using the public KIV website.", path: "/terms" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Terms", href: "/terms" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Terms</h1>
          <p>These terms describe the public website posture for Kingdom Impact Ventures. The site explains KCAN, KIV, KIS and future venture directions, but it does not create an investment offer, partnership agreement, product entitlement or guarantee of availability.</p>
          <p>Product pages are stage-aware. KIS is presented as the first flagship product in advanced launch preparation. KIE, KIM, KIP and KIH remain planned or research-stage unless official readiness, compliance and launch material are approved.</p>
          <p>Availability depends on reviewed configuration and official release links. Visitors should not treat a coming-soon page, support article or visual explainer as proof that app-store access, web-app access, payments, health services, institutional programmes or marketplace transactions are live.</p>
          <p>Legal review is required before production launch. These terms are public readiness content and should be finalised with qualified counsel before the website becomes the official production source.</p>
        </article>
      </section>
      <Section title="Important public boundaries">
        <CardGrid
          items={[
            { title: "No investment offer", body: "Investor contact routes begin a conversation; they are not a public securities offer or valuation claim." },
            { title: "No automatic partnership", body: "Partner routes invite discovery and review; they do not imply endorsement, approval or mutual obligation." },
            { title: "No unverified product access", body: "Download and web-app links appear only when official configuration is provided." },
            { title: "No regulated-service claims", body: "Payment, health, education and marketplace language remains limited until the relevant review is complete." },
          ]}
        />
      </Section>
      <Section title="Terms provisions" body="Drafted terms, pending legal review.">
        <DetailList
          items={[
            { title: "Acceptance", body: "By using this site you agree to these Terms, our Privacy Policy and our Acceptable Use Policy. If you do not agree, please do not use the site." },
            { title: "Eligibility", body: "You must be able to form a binding agreement in your jurisdiction and meet the minimum age described in our Child Safety policy to submit forms or hold a future account." },
            { title: "Your responsibilities", body: "Provide accurate information, keep any future account credentials confidential, and comply with the Acceptable Use Policy and Community Guidelines when interacting with KIV or KIS." },
            { title: "Intellectual property", body: "The KIV, KIS and KCAN names, logos and site content are owned by KIV/KCAN or its licensors. You retain ownership of content you submit, but grant us a licence to use it for the purpose you submitted it." },
            { title: "No warranty", body: "During launch preparation, the site and any preview product content are provided “as is”, without warranties of availability, fitness for a particular purpose, or non-infringement, to the extent permitted by law." },
            { title: "Limitation of liability", body: "To the extent permitted by law, our liability for claims arising from your use of the site is limited. Nothing here limits liability that cannot be excluded by law." },
            { title: "Termination", body: "We may suspend or restrict access for breach of these Terms, the Acceptable Use Policy or the Community Guidelines." },
            { title: "Governing law", body: "The specific governing law and dispute-resolution forum will be finalised with qualified counsel before production launch and stated here." },
          ]}
        />
      </Section>

    </SiteShell>
  );
}
