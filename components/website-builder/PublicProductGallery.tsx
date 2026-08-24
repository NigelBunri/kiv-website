"use client";

// Product/course/service detail page media - click-to-swap thumbnails
// plus cursor-tracked hover zoom on the active image (the classic
// ecommerce PDP pattern: move the mouse over the image, a magnified
// crop follows the cursor). Pure CSS/JS, no image-processing library -
// the "zoom" is just the same image rendered larger with its
// background-position driven by the pointer's percentage across the
// frame.
import { useRef, useState } from "react";

type Props = { images: string[]; alt: string };

export function PublicProductGallery({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return <div className="wb-item-detail-media-placeholder" aria-hidden="true" />;
  }

  const active = images[Math.min(activeIndex, images.length - 1)];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  return (
    <div className="wb-product-gallery">
      <div
        ref={frameRef}
        className="wb-product-gallery-frame"
        onMouseEnter={() => setZoomActive(true)}
        onMouseLeave={() => setZoomActive(false)}
        onMouseMove={handleMouseMove}
      >
        <img className="wb-item-detail-hero-image" src={active} alt={alt} />
        {zoomActive && (
          <div
            className="wb-product-gallery-zoom"
            style={{
              backgroundImage: `url(${active})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
            aria-hidden="true"
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="wb-product-gallery-thumbs" role="tablist">
          {images.map((url, i) => (
            <button
              key={url + i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`View image ${i + 1}`}
              className={`wb-product-gallery-thumb${i === activeIndex ? " wb-product-gallery-thumb--active" : ""}`}
              onClick={() => setActiveIndex(i)}
            >
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
