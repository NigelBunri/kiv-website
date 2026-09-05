import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, CardGrid, FAQ, Hero, ImageStory, Section } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";
import { supportArticles } from "@/lib/site";

// Each answer restates a fact already published elsewhere on the site
// (contact routing, deletion-request handling, KIS availability posture,
// stage-aware public claims) - see the linked support articles below for
// the fuller version of each.
const faqItems = [
  {
    question: "How do I contact KIV?",
    answer: "Public forms route requests to the configured server-side provider. General support is for public website and product-readiness questions; partner, investor and security reports use their own dedicated routes because they need different review and evidence.",
  },
  {
    question: "Is KIS available to download yet?",
    answer: "KIS availability is controlled by configuration. The download page only shows Android, iOS or web-app links when official links are actually configured, and never implies store delivery or account access before that.",
  },
  {
    question: "How do I request account or data deletion?",
    answer: "Use the account deletion or data deletion pages with an email address that can help verify ownership or request authority. The public website never collects passwords, recovery codes or private credentials as part of a deletion request, and some records may be retained where required for security, legal or abuse-prevention reasons.",
  },
  {
    question: "Why do some KIV pages describe features as \"planned\" rather than live?",
    answer: "KIV uses stage-aware language because payments, health, child safety, moderation, partner endorsements and public metrics all require review before they can be presented as live capabilities. A feature can be part of the product strategy without yet being ready for public availability or partner-facing commitments.",
  },
  {
    question: "Where should I report a security issue?",
    answer: "Urgent security reports should use the dedicated security reporting form or the published security contact address rather than the general contact route.",
  },
];

export const metadata = pageMetadata({ title: "Support", description: "KIV public support information and request routing.", path: "/support" });

export default function SupportPage() {
  return (
      <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Support", href: "/support" }]} />
      <Hero eyebrow="Support" title="Support routes for public website, KIS readiness and safety questions." body="Support content explains how to reach the right team without submitting private credentials, unsupported partnership claims or sensitive account information." />
      <ImageStory
        src="/images/kiv-contact-workflows-visual.jpg"
        alt="A visual routing desk showing public contact, partner, investor, security and deletion request pathways."
        eyebrow="Support map"
        title="Start with the route that matches the risk level."
        body="KIV separates general questions from partner, investor, security and deletion requests so each conversation can be reviewed with the right evidence and care."
        points={[
          "General contact is for public website and product-readiness questions.",
          "Security and deletion requests should include only the information needed to investigate safely.",
          "Partner and investor requests are routed separately because they often require evidence and review.",
        ]}
      />
      <Section title="What support can help with">
        <CardGrid
          items={[
            {
              title: "Website and public information",
              body: "Clarify public website content, product-stage language, KIS availability states and route navigation.",
            },
            {
              title: "KIS launch-list questions",
              body: "Explain coming-soon, Android, iOS and web-app states without implying availability before official links are configured.",
            },
            {
              title: "Account and data requests",
              body: "Begin deletion or data-review requests while avoiding passwords, one-time codes and private recovery information.",
            },
            {
              title: "Security reports",
              body: "Route possible vulnerabilities, unsafe behavior or suspicious website issues to the security reporting path.",
            },
          ]}
        />
      </Section>
      <Section title="Support articles">
        <div className="card-grid">
          {supportArticles.map((article) => (
            <Link className="card-link" href={`/support/${article.slug}`} key={article.slug}>
              <article className="card">
                <p className="card-meta"><time dateTime={article.date}>{article.date}</time></p>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
              </article>
            </Link>
          ))}
        </div>
      </Section>
      <Section title="Frequently asked questions">
        <FAQ items={faqItems} />
      </Section>
    </SiteShell>
  );
}
