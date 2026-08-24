import { notFound } from "next/navigation";
import { fetchWebsitePage, fetchWebsiteSite } from "@/lib/website-builder-api";
import { pageMetadata } from "@/lib/metadata";
import { WebsitePageView } from "@/components/website-builder/WebsitePageView";

// Website Builder public homepage - kingdomimpactventures.org/page/<slug>.
// No generateStaticParams: unlike every other route in this repo, this
// content changes without a rebuild (an owner publishes/edits inside the
// KIS app), so this is deliberately dynamic, server-rendered per request.
export const dynamic = "force-dynamic";

type Params = { siteSlug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { siteSlug } = await params;
  const [site, page] = await Promise.all([
    fetchWebsiteSite(siteSlug),
    fetchWebsitePage(siteSlug, "home"),
  ]);
  if (!site || !page) {
    return pageMetadata({ title: "Not found", description: "This page could not be found.", path: `/page/${siteSlug}`, robots: { index: false, follow: false } });
  }
  const seo = page.seo || site.seo;
  return pageMetadata({
    title: seo.title || site.name,
    description: seo.description || "",
    path: `/page/${siteSlug}`,
    image: seo.share_image_url ? { url: seo.share_image_url, width: 1200, height: 630, alt: site.name } : undefined,
    // Conservative default regardless of the Django flag until indexing
    // is explicitly approved for production - see lib/metadata.ts.
    robots: { index: false, follow: false },
  });
}

export default async function WebsiteHomePage({ params }: { params: Promise<Params> }) {
  const { siteSlug } = await params;
  const [site, page] = await Promise.all([
    fetchWebsiteSite(siteSlug),
    fetchWebsitePage(siteSlug, "home"),
  ]);
  if (!site || !page) notFound();
  return <WebsitePageView site={site} page={page} />;
}
