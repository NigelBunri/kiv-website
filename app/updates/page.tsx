import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, CardGrid, Hero, ImageStory, Section, Timeline } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";
import { launchWorkflow, updates } from "@/lib/site";

export const metadata = pageMetadata({ title: "Updates", description: "Official KIV public updates.", path: "/updates" });

export default function UpdatesPage() {
  return (
      <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Updates", href: "/updates" }]} />
      <Hero eyebrow="Updates" title="Public updates without hype or unsupported claims." body="KIV publishes updates about launch readiness, route changes, product status, visual explainers and production-hardening work." />
      <ImageStory
        src="/images/kiv-portfolio-roadmap.jpg"
        alt="A visual roadmap showing KIS first and future KIV ventures staged behind readiness gates."
        eyebrow="Update posture"
        title="Updates explain what changed and what still needs evidence."
        body="The website can show the full KIV direction while keeping live launch, partner, revenue, payment and health claims tied to verified readiness."
        points={[
          "KIS updates focus on launch preparation and availability configuration.",
          "Portfolio updates keep future ventures clearly marked as planned or research-stage.",
          "Production updates document security, accessibility, SEO and form-readiness work.",
        ]}
      />
      <Section title="What KIV updates cover">
        <CardGrid
          items={[
            { title: "Product readiness", body: "KIS availability, launch-list posture, platform links and product-stage changes." },
            { title: "Website hardening", body: "Accessibility, SEO, security headers, forms, provider configuration and public-route coverage." },
            { title: "Visual communication", body: "New diagrams and images that help visitors understand KCAN, KIV, KIS and the staged venture portfolio." },
          ]}
        />
      </Section>
      <Section title="Release discipline">
        <Timeline items={launchWorkflow} />
      </Section>
      <Section title="Latest updates">
        <div className="card-grid">
          {updates.map((update) => (
            <Link className="card-link" href={`/updates/${update.slug}`} key={update.slug}>
              <article className="card">
                <p className="card-meta"><time dateTime={update.date}>{update.date}</time></p>
                <h2>{update.title}</h2>
                <p>{update.description}</p>
              </article>
            </Link>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}
