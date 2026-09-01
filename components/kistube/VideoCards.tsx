import Link from "next/link";
import { fetchCards } from "@/lib/kistube-api";
import { formatDuration } from "@/lib/kistube-format";
import { ChannelsIcon, ExternalIcon } from "@/components/kistube/icons";

function hrefFor(card: { card_type: string; target_id: string; url: string }): string {
  if (card.card_type === "video") return `/kistube/watch/${card.target_id}`;
  if (card.card_type === "playlist") return `/kistube/playlist/${card.target_id}`;
  if (card.card_type === "channel") return `/kistube/channel/${card.target_id}`;
  return card.url || "#";
}

// Server Component, self-contained. Cards are timestamped teaser links in
// the real product (the little "i" icon overlays during playback) - shown
// here as a simple list near the player rather than time-synced overlays,
// since triggering them at start_seconds would need a shared ref into the
// sibling <video> element this component doesn't have access to.
export async function VideoCards({ contentId }: { contentId: string }) {
  const cards = await fetchCards(contentId);
  if (cards.length === 0) return null;

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h2 className="kt-related-heading">Featured</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
        {cards.map((card) => {
          const isExternal = card.card_type === "link";
          return (
            <Link
              key={card.id}
              href={hrefFor(card)}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              style={{
                display: "flex", alignItems: "center", gap: ".6rem", padding: ".6rem .8rem",
                border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", textDecoration: "none", color: "inherit",
              }}
            >
              {isExternal ? <ExternalIcon /> : <ChannelsIcon />}
              <span style={{ flex: 1, fontSize: ".88rem", fontWeight: 600 }}>{card.title || "Featured link"}</span>
              <span className="kt-card-meta">{formatDuration(card.start_seconds)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
