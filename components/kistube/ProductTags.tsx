import Link from "next/link";
import { fetchProductTags } from "@/lib/kistube-api";
import { formatDuration } from "@/lib/kistube-format";

// Server Component, self-contained. Shopping-tag markers shown as a
// simple list rather than time-synced scrubber markers (same reasoning
// as VideoCards - no ref into the sibling <video> element).
export async function ProductTags({ contentId }: { contentId: string }) {
  const tags = await fetchProductTags(contentId);
  if (tags.length === 0) return null;

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h2 className="kt-related-heading">Featured products</h2>
      <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
        {tags.map((tag) => (
          <Link key={tag.id} href={tag.product_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="kt-card-thumb-wrap" style={{ marginBottom: ".4rem" }}>
              {tag.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tag.thumbnail_url} alt="" />
              ) : (
                <div className="kt-card-thumb-placeholder">{tag.product_title}</div>
              )}
              <span className="kt-card-duration">{formatDuration(tag.timestamp_seconds)}</span>
            </div>
            <div style={{ fontSize: ".85rem", fontWeight: 600 }}>{tag.product_title}</div>
            {tag.price_display && <div className="kt-card-meta">{tag.price_display}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
