import { notFound } from "next/navigation";
import { fetchWebsitePage, fetchWebsiteSite } from "@/lib/website-builder-api";
import { pageMetadata } from "@/lib/metadata";
import { WebsitePageView } from "@/components/website-builder/WebsitePageView";

export const dynamic = "force-dynamic";

type Params = { siteSlug: string; pageSlug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { siteSlug, pageSlug } = await params;
  const [site, page] = await Promise.all([
    fetchWebsiteSite(siteSlug),
    fetchWebsitePage(siteSlug, pageSlug),
  ]);
  if (!site || !page) {
    return pageMetadata({ title: "Not found", description: "This page could not be found.", path: `/page/${siteSlug}/${pageSlug}`, robots: { index: false, follow: false } });
  }
  return pageMetadata({
    title: page.seo.title || page.title,
    description: page.seo.description || "",
    path: `/page/${siteSlug}/${pageSlug}`,
    image: page.seo.share_image_url ? { url: page.seo.share_image_url, width: 1200, height: 630, alt: page.title } : undefined,
    robots: { index: false, follow: false },
  });
}

export default async function WebsiteSubPage({ params }: { params: Promise<Params> }) {
  const { siteSlug, pageSlug } = await params;
  const [site, page] = await Promise.all([
    fetchWebsiteSite(siteSlug),
    fetchWebsitePage(siteSlug, pageSlug),
  ]);
  if (!site || !page) notFound();
  return <WebsitePageView site={site} page={page} />;
}
