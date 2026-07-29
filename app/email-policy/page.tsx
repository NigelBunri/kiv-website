import { CardGrid, DetailList, Section } from "@/components/PageBlocks";
import { SiteShell } from "@/components/SiteShell";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Email Policy", description: "How KIV prepares responsible transactional email.", path: "/email-policy" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Email Policy", href: "/email-policy" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Email Policy</h1>
          <p>KIV prepares email as a requested, transactional and operational communication channel. Public forms should not pretend that delivery occurred unless a production provider is configured server-side.</p>
          <p>Email may be used for contact replies, launch-list confirmation, partner follow-up, investor routing, security reports, deletion requests and future account-related actions once the relevant provider, DNS and security controls are ready.</p>
          <p>Messages should explain why the recipient received the email, how to ignore unrequested actions, and how to contact KIV if something appears suspicious.</p>
          <p>No purchased, scraped or unrelated marketing lists are allowed. Sender identity, SPF, DKIM, DMARC and provider reputation should be reviewed before production launch.</p>
        </article>
      </section>
      <Section title="Email readiness checklist">
        <CardGrid
          items={[
            { title: "Provider configured server-side", body: "API keys, SMTP secrets and delivery credentials must never be exposed in the browser." },
            { title: "Domain authentication", body: "Production sending should use verified sender identity, SPF, DKIM and DMARC alignment." },
            { title: "Clear purpose", body: "Each message should identify the request, route or account action that caused it." },
            { title: "No list abuse", body: "KIV should avoid purchased lists, scraped lists and unrequested bulk email." },
          ]}
        />
      </Section>
      <Section title="What you can expect" body="Drafted terms, pending legal review.">
        <DetailList
          items={[
            { title: "Why we email you", body: "Only to respond to a request you made, confirm launch-list interest, or, once accounts exist, send account and security-related notices." },
            { title: "Marketing preferences", body: "Any future marketing email will include a clear unsubscribe link. Transactional or security email cannot be unsubscribed from while your account is active." },
            { title: "Recognising legitimate email", body: `Official email comes only from the ${site.domain} domain. We will never ask for your password or a one-time code by email.` },
            { title: "Reporting suspicious email", body: `Forward anything suspicious to ${site.securityEmail} before clicking any links.` },
            { title: "Authentication", body: "Production sending will be configured with SPF, DKIM and DMARC alignment to reduce spoofing risk." },
          ]}
        />
      </Section>

    </SiteShell>
  );
}
