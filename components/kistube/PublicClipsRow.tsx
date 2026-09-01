import { formatDuration } from "@/lib/kistube-format";

const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

type PublicClip = { id: string; title: string; start_seconds: number; end_seconds: number; clip_url?: string; thumbnail_url?: string; created_at: string };

async function fetchPublicClips(contentId: string): Promise<PublicClip[]> {
  try {
    const base = (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");
    const res = await fetch(`${base}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/clips/public/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Self-contained Server Component - the coordinator drops
// <PublicClipsRow contentId={...} /> into the watch page. Renders nothing
// when there are no public clips, so it's always safe to include.
export async function PublicClipsRow({ contentId }: { contentId: string }) {
  const clips = await fetchPublicClips(contentId);
  if (clips.length === 0) return null;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h2 className="kt-related-heading">Clips from this video</h2>
      <div className="kt-related-list">
        {clips.map((clip) => (
          <a key={clip.id} href={clip.clip_url || "#"} target={clip.clip_url ? "_blank" : undefined} rel="noreferrer" className="kt-related-card">
            <div className="kt-related-thumb">
              {clip.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={clip.thumbnail_url} alt="" />
              ) : null}
              <span className="kt-card-duration">{formatDuration(clip.end_seconds - clip.start_seconds)}</span>
            </div>
            <div>
              <h3 className="kt-card-title">{clip.title || "Untitled clip"}</h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
