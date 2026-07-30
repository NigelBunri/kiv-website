import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, CardGrid, Hero, ImageStory, Section } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";
import { supportArticles } from "@/lib/site";

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
              <article className="card"><h2>{article.title}</h2><p>{article.description}</p></article>
            </Link>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}
