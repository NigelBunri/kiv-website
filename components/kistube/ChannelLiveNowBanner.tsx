import Link from "next/link";

const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

type LiveStreamRow = { id: string; content_id: string; title: string; status: string; viewer_count: number };

async function fetchLiveNow(channelId: string): Promise<LiveStreamRow | null> {
  try {
    const base = (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");
    const res = await fetch(`${base}/api/v1/broadcasts/channels/${encodeURIComponent(channelId)}/live-streams/?status=live`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const rows: LiveStreamRow[] = Array.isArray(data?.results) ? data.results : [];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// Server Component, self-contained. Renders nothing when the channel
// isn't currently live.
export async function ChannelLiveNowBanner({ channelId }: { channelId: string }) {
  const live = await fetchLiveNow(channelId);
  if (!live) return null;

  return (
    <Link
      href={`/kistube/watch/${live.content_id}`}
      style={{
        display: "flex", alignItems: "center", gap: ".75rem", padding: ".85rem 1rem", marginBottom: "1.25rem",
        borderRadius: "var(--radius-md)", background: "var(--danger)", color: "#fff", textDecoration: "none",
      }}
    >
      <span className="kt-card-live-badge" style={{ position: "static", background: "rgba(255,255,255,.25)" }}>Live</span>
      <span style={{ fontWeight: 700, flex: 1 }}>{live.title}</span>
      <span style={{ fontSize: ".82rem", opacity: 0.9 }}>{live.viewer_count} watching</span>
    </Link>
  );
}
