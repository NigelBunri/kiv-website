import { fetchChapters } from "@/lib/kistube-api";
import { formatDuration } from "@/lib/kistube-format";

// Server Component, self-contained - the coordinator drops
// <VideoChapters contentId={...} /> below the player. Renders nothing
// when there are no chapters. Timestamps are informational (not wired to
// seek the actual <video> element, which lives in a sibling component
// this one has no ref access to).
export async function VideoChapters({ contentId }: { contentId: string }) {
  const chapters = await fetchChapters(contentId);
  if (chapters.length === 0) return null;

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h2 className="kt-related-heading">Chapters</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: ".3rem" }}>
        {chapters.map((chapter) => (
          <li key={chapter.id} style={{ display: "flex", gap: ".75rem", fontSize: ".88rem" }}>
            <span style={{ color: "var(--gold-strong)", fontWeight: 700, minWidth: 48 }}>{formatDuration(chapter.start_seconds)}</span>
            <span>{chapter.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
