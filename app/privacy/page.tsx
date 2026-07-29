import { CardGrid, DetailList, ImageStory, Section } from "@/components/PageBlocks";
import { SiteShell } from "@/components/SiteShell";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Privacy", description: "How KIV handles public website and request data.", path: "/privacy" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Privacy", href: "/privacy" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Privacy</h1>
          <p>KIV handles public website and request data with a minimisation posture: collect only what is needed, route it to the correct workflow, and avoid asking visitors for credentials.</p>
          <p>The public site may receive contact, partner, investor, launch-list, deletion and security requests. Those requests should include enough context to respond, but not passwords, one-time codes, private recovery details or unnecessary sensitive records.</p>
          <p>Production form delivery depends on server-side provider configuration. Provider secrets, API keys and delivery credentials must stay server-only and must not be exposed to the browser.</p>
          <p>KIS account, messaging, partner, Bible/study and future marketplace or health-support data require product-specific privacy controls before broad public release. Those controls should be reviewed alongside legal, security and operational requirements.</p>
          <p>Legal review is required before production launch. This page explains the intended privacy posture and does not replace jurisdiction-specific legal advice.</p>
        </article>
      </section>
      <ImageStory
        src="/images/kiv-trust-security-visual.jpg"
        alt="A visual privacy and security operations dashboard for KIV."
        eyebrow="Privacy posture"
        title="Data handling follows the request path."
        body="Each public route is designed to collect the minimum information needed for that route and avoid stronger claims until product systems are ready."
        points={[
          "Public contact data is different from product account data.",
          "Deletion requests require verification before account or record changes.",
          "Future product data rules must be reviewed before wider KIS release.",
        ]}
      />
      <Section title="Visitor data scenarios">
        <CardGrid
          items={[
            { title: "General enquiry", body: "Name, email and message details may be used to respond to a public website question or route the request internally." },
            { title: "Launch-list interest", body: "A visitor can register interest without the site claiming that app-store or web-app access is already available." },
            { title: "Security report", body: "Reports should include enough technical detail to investigate safely, but never active credentials or unrelated personal data." },
            { title: "Deletion request", body: "KIV must verify ownership or identity before making account or data changes." },
          ]}
        />
      </Section>
      <Section title="Privacy policy provisions" body="Drafted terms, pending legal review.">
        <DetailList
          items={[
            { title: "Information we collect", body: "Contact details you submit through public forms (name, email, organisation, message); technical data collected automatically for security and abuse prevention (IP address, device and browser information); and, once KIS accounts are live, product data such as profile details, messages and activity." },
            { title: "How we use it", body: "To respond to your request, operate and secure the site, prevent fraud and abuse, comply with legal obligations, and improve the service. We do not sell personal data." },
            { title: "Who we share it with", body: "Only service providers acting on our behalf under confidentiality obligations, currently Cloudflare (hosting, security and bot protection) and a spreadsheet-based workflow used to route form submissions. We do not share data with third parties for their own advertising purposes." },
            { title: "Data retention", body: "Form submissions and account data are kept only as long as needed for the purpose collected, or as required by law, then deleted or anonymised." },
            { title: "Your rights", body: "Depending on where you live, you may have the right to access, correct, delete or export your data, and to object to or restrict certain processing. Use /data-deletion or /account-deletion to exercise these rights, or contact us at " + site.legalEmail + "." },
            { title: "Children's privacy", body: "We do not knowingly collect personal information from children below the applicable age of digital consent without required parental involvement. See our Child Safety policy." },
            { title: "International transfers", body: "Data may be processed in countries other than your own; we take steps intended to protect it consistently with this policy wherever it is processed." },
            { title: "Changes to this policy", body: "We will update the effective date here and, where a change is material, provide additional notice on the site." },
          ]}
        />
      </Section>

    </SiteShell>
  );
}
