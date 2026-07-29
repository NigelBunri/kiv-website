import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { BreadcrumbJsonLd, JsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl, updateBySlug, updates, site } from "@/lib/site";

export function generateStaticParams() {
  return updates.map((update) => ({ slug: update.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const update = updateBySlug(slug);
  return pageMetadata({ title: update?.title ?? "Update", description: update?.description ?? "KIV update.", path: `/updates/${slug}`, type: "article" });
}

export default async function UpdatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const update = updateBySlug(slug);
  if (!update) notFound();
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Updates", href: "/updates" }, { name: update.title, href: `/updates/${slug}` }]} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: update.title,
        description: update.description,
        datePublished: update.date,
        author: { "@type": "Organization", name: site.name },
        publisher: { "@type": "Organization", name: site.name },
        mainEntityOfPage: absoluteUrl(`/updates/${slug}`),
      }} />
      <section className="content-page">
        <article>
          <p className="eyebrow">{update.date}</p>
          <h1>{update.title}</h1>
          <p>{update.description}</p>
          {update.sections.map((section) => <p key={section}>{section}</p>)}
        </article>
      </section>
    </SiteShell>
  );
}
