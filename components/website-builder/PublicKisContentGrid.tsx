"use client";

import { useRef, useState } from "react";
import { BuyButton } from "./BuyButton";
import { OpenInApp } from "./OpenInApp";
import { PublicAddToCartButton } from "./PublicAddToCartButton";
import type { WebsiteBuilderKisContentItem } from "@/lib/website-builder-api";

type Props = {
  items: WebsiteBuilderKisContentItem[];
  hasMore: boolean;
  targetType: string;
  siteSlug: string;
  pageSlug: string;
  sectionId: string;
  /** From the editor's `presentation` field — grid is the historical
   * default (every section created before this option existed behaves
   * as grid). carousel = horizontal scroll-snap row with arrow controls,
   * list = stacked horizontal cards (image beside text, not above it). */
  displayMode?: "grid" | "carousel" | "list";
  /** Grid mode only — column count on wide screens. */
  columns?: number;
};

// Only these target types have an on-site detail page (see
// resolve_kis_content_item_detail's _DETAIL_RESOLVERS on the backend) —
// everything else (health_service, broadcast_channel, post, event,
// testimonial) has no on-site checkout surface and goes straight to the
// app instead, same as the deep_link already used for their OpenInApp
// button.
const DETAIL_PAGE_TARGET_TYPES = new Set(["product", "course", "shop_service"]);

export function PublicKisContentGrid({
  items: initialItems,
  hasMore: initialHasMore,
  targetType,
  siteSlug,
  pageSlug,
  sectionId,
  displayMode = "grid",
  columns = 3,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollCarousel(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.min(track.clientWidth * 0.9, 640), behavior: "smooth" });
  }

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

  const cards = items.map((item) => {
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
        {targetType === "product" ? <PublicAddToCartButton productId={item.id} /> : null}
      </div>
    );
  });

  // List mode needs its own DOM shape — everything but the image grouped
  // into one body column so it can be vertically centered and padded as
  // a unit, rather than laid out as loose flex siblings next to the
  // image (which is what grid/carousel's flat structure above does).
  const listCards = items.map((item) => {
    const href = hasDetailPage ? `/page/${siteSlug}/item/${targetType}/${item.id}` : item.deep_link || undefined;
    return (
      <div key={item.id} className="wb-kis-content-card wb-kis-content-card--list">
        {item.image_url && (
          <a href={href} className="wb-kis-content-card-media">
            <img src={item.image_url} alt={item.title} />
          </a>
        )}
        <div className="wb-kis-content-card-body">
          <a href={href} className="wb-kis-content-card-title-link"><h3>{item.title}</h3></a>
          {item.description && <p>{item.description}</p>}
          {item.price_display && <p className="wb-price">{item.price_display}</p>}
          <div className="wb-kis-content-card-actions">
            <OpenInApp deepLink={item.deep_link} />
            <BuyButton targetType={targetType} item={item} shopId={item.shop_id} />
            {targetType === "product" ? <PublicAddToCartButton productId={item.id} /> : null}
          </div>
        </div>
      </div>
    );
  });

  return (
    <>
      {displayMode === "carousel" ? (
        <div className="wb-kis-content-carousel-wrap">
          <div ref={trackRef} className="wb-kis-content-carousel">{cards}</div>
          {items.length > 1 && (
            <>
              <button type="button" className="wb-carousel-arrow wb-carousel-arrow--prev" onClick={() => scrollCarousel(-1)} aria-label="Previous">‹</button>
              <button type="button" className="wb-carousel-arrow wb-carousel-arrow--next" onClick={() => scrollCarousel(1)} aria-label="Next">›</button>
            </>
          )}
        </div>
      ) : displayMode === "list" ? (
        <div className="wb-kis-content-list">{listCards}</div>
      ) : (
        <div className="wb-kis-content-grid" style={{ "--wb-grid-columns": Math.max(1, Math.min(6, columns)) } as React.CSSProperties}>{cards}</div>
      )}
      {hasMore && (
        <button type="button" className="wb-button wb-load-more" onClick={loadMore} disabled={loading}>
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </>
  );
}
