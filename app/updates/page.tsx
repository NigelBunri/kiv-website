import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Hero, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { updates } from "@/lib/site";

export const metadata = pageMetadata({ title: "Updates", description: "Official KIV public updates.", path: "/updates" });

export default function UpdatesPage() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Updates", href: "/updates" }]} />
      <Hero eyebrow="Updates" title="Public updates without hype or unsupported claims." body="KIV publishes concise updates about launch readiness, route changes and product status." />
      <Section title="Latest updates">
        <div className="card-grid">
          {updates.map((update) => (
            <Link className="card-link" href={`/updates/${update.slug}`} key={update.slug}>
              <article className="card">
                <p className="card-meta">{update.date}</p>
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
