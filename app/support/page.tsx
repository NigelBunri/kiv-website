import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Hero, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { supportArticles } from "@/lib/site";

export const metadata = pageMetadata({ title: "Support", description: "KIV public support information and request routing.", path: "/support" });

export default function SupportPage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Support", href: "/support" }]} />
      <Hero eyebrow="Support" title="Support routes for public website and product-readiness questions." body="Support content is intentionally narrow until product availability and account workflows are fully live." />
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
