"use client";

import { useState } from "react";

// Shared by the moderation queue and the media-safety scans page - both
// need to show the actual flagged file (image or video) to a reviewer.
// Blurred-by-default with an explicit reveal click, matching standard
// trust & safety tooling conventions: avoids surprising an admin with
// explicit content on page load, and avoids it being visible over their
// shoulder or in a stray screenshot before they deliberately choose to
// look. The signed URL itself is fetched only on reveal, not on page
// load, and is short-lived (120s) - see admin_control's
// AdminMediaSafetyScanMediaUrlView.
export function RevealableMedia({ scanId, mimeType }: { scanId: string; mimeType: string }) {
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  async function reveal() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/control/admin/media-safety/scans/${scanId}/media-url`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Could not load the flagged file.");
      setMediaUrl(data.data?.url || "");
      setRevealed(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load the flagged file.");
    } finally {
      setLoading(false);
    }
  }

  function hide() {
    setRevealed(false);
    setMediaUrl("");
  }

  if (!revealed) {
    return (
      <div className="media-safety-blur-box">
        <button type="button" className="button secondary" onClick={reveal} disabled={loading}>
          {loading ? "Loading…" : "Show flagged content"}
        </button>
        {error ? <p className="control-error">{error}</p> : null}
      </div>
    );
  }

  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");

  return (
    <div className="media-safety-reveal-box">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl} alt="Flagged upload" className="media-safety-media" />
      ) : isVideo ? (
        <video src={mediaUrl} controls className="media-safety-media" />
      ) : (
        <a href={mediaUrl} target="_blank" rel="noreferrer noopener">Open flagged file</a>
      )}
      <button type="button" className="button secondary" onClick={hide}>Hide</button>
    </div>
  );
}
