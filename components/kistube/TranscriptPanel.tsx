import { fetchTranscript } from "@/lib/kistube-api";

// Server Component, self-contained. Renders nothing when no ready
// transcript exists for the given language (the "Show transcript"
// text-only fallback - the actual caption <track> is wired directly into
// the shared <video> element during final page assembly, since it has to
// live inside that specific element's JSX).
export async function TranscriptPanel({ contentId }: { contentId: string }) {
  const transcript = await fetchTranscript(contentId);
  if (!transcript || transcript.status !== "ready" || !transcript.text_plain) return null;

  return (
    <details style={{ marginBottom: "1.25rem" }}>
      <summary className="kt-related-heading" style={{ cursor: "pointer", display: "inline-block" }}>Show transcript</summary>
      <div className="kt-watch-description" style={{ marginTop: ".5rem", maxHeight: 320, overflowY: "auto" }}>
        {transcript.text_plain}
      </div>
    </details>
  );
}
