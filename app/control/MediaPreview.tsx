"use client";

// Renders a real preview for a material/product/asset instead of a bare
// text row — an actual <img>/<video> for image/video kinds, a link-out for
// everything else. `url` must already be a browser-loadable URL (e.g. the
// backend's resolved `safe_resource_url` for education materials, which
// signs private S3 object keys server-side — never the raw `resource_url`,
// which can be an unsigned private key that 404s).
export default function MediaPreview({ kind, url, title }: { kind: string; url?: string; title: string }) {
  if (!url) return null;
  const normalizedKind = (kind || "").toLowerCase();

  if (normalizedKind === "video") {
    return (
      <video controls preload="metadata" className="control-media-preview" style={{ maxWidth: "320px", maxHeight: "200px" }}>
        <source src={url} />
      </video>
    );
  }
  if (normalizedKind === "image" || /\.(png|jpe?g|gif|webp|svg)$/i.test(url)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={title} className="control-media-preview" style={{ maxWidth: "160px", maxHeight: "160px", objectFit: "cover", borderRadius: "8px" }} />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer noopener" className="control-media-link">
      Open {normalizedKind || "file"}
    </a>
  );
}
