import { fetchAudioTracks } from "@/lib/kistube-api";

// Server Component, self-contained. Lists available audio-language tracks
// informationally - not wired to actually swap the shared <video>
// element's audio source (would need a ref shared across components this
// one doesn't have access to), so this shows what's available rather than
// switching playback.
export async function AudioTrackList({ contentId }: { contentId: string }) {
  const tracks = await fetchAudioTracks(contentId);
  if (tracks.length <= 1) return null;

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <span className="kt-card-meta">
        Available audio: {tracks.map((track) => track.label || track.language_code).join(", ")}
      </span>
    </div>
  );
}
