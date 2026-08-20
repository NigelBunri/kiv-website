"use client";

import { useState } from "react";
import { BuyButton } from "./BuyButton";
import { OpenInApp } from "./OpenInApp";
import type { WebsiteBuilderKisContentItem } from "@/lib/website-builder-api";

type Props = {
  items: WebsiteBuilderKisContentItem[];
  hasMore: boolean;
  targetType: string;
  siteSlug: string;
  pageSlug: string;
  sectionId: string;
};

// Only these target types have an on-site detail page (see
// resolve_kis_content_item_detail's _DETAIL_RESOLVERS on the backend) —
// everything else (health_service, broadcast_channel, post, event,
// testimonial) has no on-site checkout surface and goes straight to the
// app instead, same as the deep_link already used for their OpenInApp
// button.
const DETAIL_PAGE_TARGET_TYPES = new Set(["product", "course", "shop_service"]);

export function PublicKisContentGrid({ items: initialItems, hasMore: initialHasMore, targetType, siteSlug, pageSlug, sectionId }: Props) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/website-kis-content/${encodeURIComponent(siteSlug)}/${encodeURIComponent(pageSlug)}/${encodeURIComponent(sectionId)}?offset=${items.length}`,
      );
      const data = await response.json().catch(() => ({}));
      setItems((prev) => [...prev, ...(Array.isArray(data.items) ? data.items : [])]);
      setHasMore(Boolean(data.has_more));
    } catch {
      // Leave items/hasMore as they were — the button stays visible to retry.
    } finally {
      setLoading(false);
    }
  }

  const hasDetailPage = DETAIL_PAGE_TARGET_TYPES.has(targetType);

  return (
    <>
      <div className="wb-kis-content-grid">
        {items.map((item) => {
          const href = hasDetailPage ? `/page/${siteSlug}/item/${targetType}/${item.id}` : item.deep_link || undefined;
          return (
            <div key={item.id} className="wb-kis-content-card">
              {item.image_url && (
                <a href={href}>
                  <img src={item.image_url} alt={item.title} />
                </a>
              )}
              <a href={href} className="wb-kis-content-card-title-link"><h3>{item.title}</h3></a>
              {item.description && <p>{item.description}</p>}
              {item.price_display && <p className="wb-price">{item.price_display}</p>}
              <OpenInApp deepLink={item.deep_link} />
              <BuyButton targetType={targetType} item={item} shopId={item.shop_id} />
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button type="button" className="wb-button wb-load-more" onClick={loadMore} disabled={loading}>
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </>
  );
}
