"use client";

// Slim bar that sticks to the bottom of the viewport once the page's
// own buy/book action has scrolled out of view — the shopper never has
// to scroll back up to purchase. Reuses BuyButton as-is (same checkout
// path, same behavior), just re-rendered in a fixed-position shell.
// Not a cart — this site's checkout is still single-item "buy now" per
// product/service/course (see BuyButton.tsx); a real multi-item cart
// drawer would need new Cart/Order backend models and is a separate,
// larger piece of work.
import { useEffect, useRef, useState } from "react";
import type { WebsiteBuilderKisContentItem } from "@/lib/website-builder-api";
import { BuyButton } from "./BuyButton";

type Props = {
  targetType: string;
  item: WebsiteBuilderKisContentItem;
  shopId?: string;
  priceDisplay?: string;
};

export function PublicStickyBuyBar({ targetType, item, shopId, priceDisplay }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { rootMargin: "0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Placed right after the primary action area in WebsiteItemDetailView — once this scrolls above the viewport, the sticky bar appears. */}
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
      <div className={`wb-sticky-buy-bar${visible ? " wb-sticky-buy-bar--visible" : ""}`} aria-hidden={!visible}>
        <div className="wb-sticky-buy-bar-inner">
          {item.image_url ? <img src={item.image_url} alt="" className="wb-sticky-buy-bar-image" /> : null}
          <div className="wb-sticky-buy-bar-copy">
            <span className="wb-sticky-buy-bar-title">{item.title}</span>
            {priceDisplay ? <span className="wb-sticky-buy-bar-price">{priceDisplay}</span> : null}
          </div>
          <div className="wb-sticky-buy-bar-action">
            <BuyButton targetType={targetType} item={item} shopId={shopId} />
          </div>
        </div>
      </div>
    </>
  );
}
