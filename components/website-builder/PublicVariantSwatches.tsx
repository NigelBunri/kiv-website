"use client";

// Size/color (or any other option) swatch selector for a product's
// variants — display/preview only. Selecting a combination shows that
// specific variant's own price and stock so a shopper can compare
// before deciding, but purchasing still always buys the base product:
// checkout has no variant concept yet (see resolve_product_detail's
// docstring on the backend). Swatches are simply not shown on products
// with no variants (the common case today), so this changes nothing
// for the vast majority of listings.
import { useMemo, useState } from "react";
import type { WebsiteBuilderProductVariant } from "@/lib/website-builder-api";

type Props = {
  variants: WebsiteBuilderProductVariant[];
  basePriceDisplay: string;
  baseCompareAtPriceDisplay?: string;
};

export function PublicVariantSwatches({ variants, basePriceDisplay, baseCompareAtPriceDisplay }: Props) {
  const optionGroups = useMemo(() => {
    const groups = new Map<string, Set<string>>();
    for (const variant of variants) {
      for (const [key, value] of Object.entries(variant.options || {})) {
        if (!value) continue;
        if (!groups.has(key)) groups.set(key, new Set());
        groups.get(key)!.add(value);
      }
    }
    return Array.from(groups.entries()).map(([key, values]) => ({ key, values: Array.from(values) }));
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string>>({});

  if (!variants.length || !optionGroups.length) return null;

  const matched = variants.find((v) =>
    optionGroups.every((group) => !selected[group.key] || v.options[group.key] === selected[group.key]),
  );
  const showingVariant = Object.keys(selected).length === optionGroups.length ? matched : null;

  return (
    <div className="wb-variant-swatches">
      {optionGroups.map((group) => (
        <div key={group.key} className="wb-variant-swatch-group">
          <span className="wb-variant-swatch-label">{group.key}</span>
          <div className="wb-variant-swatch-row">
            {group.values.map((value) => {
              const isActive = selected[group.key] === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`wb-variant-swatch${isActive ? " wb-variant-swatch--active" : ""}`}
                  onClick={() => setSelected((prev) => ({ ...prev, [group.key]: isActive ? "" : value }))}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="wb-item-detail-price wb-variant-swatch-price">
        {showingVariant ? showingVariant.price_display : basePriceDisplay}
        {(showingVariant ? showingVariant.compare_at_price_display : baseCompareAtPriceDisplay) ? (
          <s className="wb-item-detail-compare-price">
            {showingVariant ? showingVariant.compare_at_price_display : baseCompareAtPriceDisplay}
          </s>
        ) : null}
        {showingVariant && !showingVariant.in_stock ? <span className="wb-item-detail-stock wb-item-detail-stock--out"> — Out of stock</span> : null}
      </p>
      {!showingVariant && (
        <p className="wb-variant-swatch-hint">Select {optionGroups.map((g) => g.key.toLowerCase()).join(" and ")} to see exact price and availability.</p>
      )}
    </div>
  );
}
