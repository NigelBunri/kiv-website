"use client";

import { useState } from "react";
import { BuyButton } from "./BuyButton";
import type { WebsiteBuilderKisContentItem } from "@/lib/website-builder-api";

type Props = {
  items: WebsiteBuilderKisContentItem[];
  hasMore: boolean;
  targetType: string;
  siteSlug: string;
  pageSlug: string;
  sectionId: string;
};

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

  return (
    <>
      <div className="wb-kis-content-grid">
        {items.map((item) => (
          <div key={item.id} className="wb-kis-content-card">
            {item.image_url && (
              <a href={item.deep_link || undefined}>
                <img src={item.image_url} alt={item.title} />
              </a>
            )}
            <h3>{item.title}</h3>
            {item.description && <p>{item.description}</p>}
            {item.price_display && <p className="wb-price">{item.price_display}</p>}
            <BuyButton targetType={targetType} item={item} shopId={item.shop_id} />
          </div>
        ))}
      </div>
      {hasMore && (
        <button type="button" className="wb-button wb-load-more" onClick={loadMore} disabled={loading}>
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </>
  );
}
