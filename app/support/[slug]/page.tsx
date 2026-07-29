import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { supportArticles, supportBySlug } from "@/lib/site";

export function generateStaticParams() {
  return supportArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = supportBySlug(slug);
  return pageMetadata({ title: article?.title ?? "Support", description: article?.description ?? "KIV support article.", path: `/support/${slug}` });
}

export default async function SupportArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = supportBySlug(slug);
  if (!article) notFound();
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Support", href: "/support" }, { name: article.title, href: `/support/${slug}` }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Support</p>
          <h1>{article.title}</h1>
          <p>{article.description}</p>
          {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </article>
      </section>
    </SiteShell>
  );
}
