import { CardGrid, DetailList, Section } from "@/components/PageBlocks";
import { SiteShell } from "@/components/SiteShell";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Acceptable Use", description: "Acceptable-use expectations for KIV public channels.", path: "/acceptable-use" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Acceptable Use", href: "/acceptable-use" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Acceptable Use</h1>
          <p>Acceptable use starts with safe public communication. Visitors should use KIV forms for real questions, partner enquiries, investor conversations, launch-list interest, security reports and deletion requests only.</p>
          <p>Do not submit unlawful, abusive, harmful, deceptive, automated, spam, impersonation, credential-bearing or exploitative content through public routes. Do not use the site to test stolen credentials, share private recovery details or pressure the team into unsupported claims.</p>
          <p>KIV may reject, ignore, preserve or escalate requests that appear abusive, unsafe, fraudulent or outside the purpose of the public website.</p>
          <p>Future KIS communities will require product-specific moderation, reporting, child-safety and enforcement rules before broad public operation.</p>
        </article>
      </section>
      <Section title="Use the site for">
        <CardGrid
          items={[
            { title: "Clear public questions", body: "Ask about the KIV website, KCAN relationship, KIS readiness or product-stage language." },
            { title: "Good-faith reports", body: "Report security, safety, data or content concerns with enough context to review them responsibly." },
            { title: "Serious partner conversations", body: "Share institution, ministry, creator or operational needs without claiming partnership before review." },
            { title: "Stage-aware requests", body: "Ask about planned ventures while recognising that future products are not publicly launched unless stated." },
          ]}
        />
      </Section>
      <Section title="Prohibited conduct" body="Drafted terms, pending legal review.">
        <DetailList
          items={[
            { title: "Illegal activity", body: "Using the site to plan, facilitate or promote unlawful acts, fraud, or infringement of others' intellectual property or rights." },
            { title: "Harassment and hate", body: "Threats, harassment, hate speech, or content that demeans others on the basis of a protected characteristic." },
            { title: "Deception and impersonation", body: "Phishing, impersonating KIV, KIS or KCAN staff or any other individual or organisation, or spreading false claims about the platform." },
            { title: "Malicious activity", body: "Uploading malware, attempting to breach site security, scraping the site at scale, or circumventing rate limits and CAPTCHA protections." },
            { title: "Spam and automation", body: "Submitting forms via bots or scripts, or using the site to send unsolicited bulk messages." },
            { title: "Child exploitation", body: "Any content or conduct endangering minors is prohibited absolutely and will be reported to the relevant authorities. See our Child Safety policy." },
            { title: "Enforcement", body: "Violations may result in warnings, rate-limit or IP restrictions, permanent bans, and referral to law enforcement where required by law." },
          ]}
        />
      </Section>

    </SiteShell>
  );
}
