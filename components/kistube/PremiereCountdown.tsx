import { fetchPremiere } from "@/lib/kistube-api";

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "starting now";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Server Component, self-contained. Renders nothing unless a premiere is
// actually configured for this content. The countdown is a page-load
// snapshot (this page already sets revalidate=0, so a refresh gets a
// fresh number) rather than a live client-side ticking clock.
export async function PremiereCountdown({ contentId }: { contentId: string }) {
  const premiere = await fetchPremiere(contentId);
  if (!premiere) return null;

  return (
    <div className="kt-authgate" style={{ marginBottom: "1.25rem" }}>
      {premiere.is_live_now ? (
        <p style={{ fontWeight: 700 }}>This premiere is live now.</p>
      ) : (
        <p style={{ fontWeight: 700 }}>Premieres in {formatCountdown(premiere.seconds_until_premiere)}</p>
      )}
      {premiere.viewer_count > 0 && <p className="kt-card-meta">{premiere.viewer_count} waiting</p>}
    </div>
  );
}
