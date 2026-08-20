import { notFound } from "next/navigation";
import { fetchWebsiteKisContentDetail, fetchWebsiteSite } from "@/lib/website-builder-api";
import { pageMetadata } from "@/lib/metadata";
import { WebsiteItemDetailView } from "@/components/website-builder/WebsiteItemDetailView";

export const dynamic = "force-dynamic";

type Params = { siteSlug: string; targetType: string; itemId: string };

// Only these target types actually resolve server-side (see
// resolve_kis_content_item_detail's _DETAIL_RESOLVERS) — the rest
// (health_service, broadcast_channel, post, event, testimonial) have no
// on-site checkout surface and stay app-only (deep_link on the card).
const SUPPORTED_TARGET_TYPES = new Set(["product", "course", "shop_service"]);

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { siteSlug, targetType, itemId } = await params;
  if (!SUPPORTED_TARGET_TYPES.has(targetType)) {
    return pageMetadata({ title: "Not found", description: "This item could not be found.", path: `/page/${siteSlug}/item/${targetType}/${itemId}`, robots: { index: false, follow: false } });
  }
  const detail = await fetchWebsiteKisContentDetail(siteSlug, targetType, itemId);
  if (!detail) {
    return pageMetadata({ title: "Not found", description: "This item could not be found.", path: `/page/${siteSlug}/item/${targetType}/${itemId}`, robots: { index: false, follow: false } });
  }
  return pageMetadata({
    title: `${detail.item.title} — ${detail.site.name}`,
    description: detail.item.description || "",
    path: `/page/${siteSlug}/item/${targetType}/${itemId}`,
    image: detail.item.image_url ? { url: detail.item.image_url, width: 1200, height: 630, alt: detail.item.title } : undefined,
    robots: { index: false, follow: false },
  });
}

export default async function WebsiteItemDetailPage({ params }: { params: Promise<Params> }) {
  const { siteSlug, targetType, itemId } = await params;
  if (!SUPPORTED_TARGET_TYPES.has(targetType)) notFound();

  const [site, detail] = await Promise.all([
    fetchWebsiteSite(siteSlug),
    fetchWebsiteKisContentDetail(siteSlug, targetType, itemId),
  ]);
  if (!site || !detail) notFound();

  return <WebsiteItemDetailView site={site} item={detail.item} targetType={targetType} />;
}
