"use client";

// Full-width autoplaying carousel - field names (slides[].imageUrl|
// headline|subheadline|ctaText|ctaLink, autoplay, intervalSeconds) match
// the RN Website Builder editor's `slideshow` section vocabulary exactly
// (KIS/src/components/section-builder/types.ts's SlideshowSectionData).
import { useEffect, useState } from "react";

type Slide = { id?: string; imageUrl?: string; headline?: string; subheadline?: string; ctaText?: string; ctaLink?: string };

type Props = { data: Record<string, unknown> };

export function PublicSlideshow({ data }: Props) {
  const slides = Array.isArray(data.slides) ? (data.slides as Slide[]).filter((s) => s?.imageUrl) : [];
  const autoplay = data.autoplay !== false;
  const intervalMs = Math.max(2, Math.min(30, Number(data.intervalSeconds) || 5)) * 1000;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!autoplay || slides.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(timer);
  }, [autoplay, intervalMs, slides.length]);

  if (!slides.length) return null;

  return (
    <section className="wb-section wb-slideshow" aria-roledescription="carousel">
      <div className="wb-slideshow-track">
        {slides.map((slide, i) => (
          <div
            key={slide.id || i}
            className={`wb-slideshow-slide${i === active ? " wb-slideshow-slide--active" : ""}`}
            style={slide.imageUrl ? { backgroundImage: `url(${slide.imageUrl})` } : undefined}
            aria-hidden={i !== active}
          >
            <div className="wb-slideshow-copy">
              {slide.headline ? <h1>{slide.headline}</h1> : null}
              {slide.subheadline ? <p className="wb-hero-subheadline">{slide.subheadline}</p> : null}
              {slide.ctaText && slide.ctaLink ? <a className="wb-button" href={slide.ctaLink}>{slide.ctaText}</a> : null}
            </div>
          </div>
        ))}
      </div>
      {slides.length > 1 ? (
        <div className="wb-slideshow-dots" role="tablist">
          {slides.map((slide, i) => (
            <button
              key={slide.id || i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Slide ${i + 1}`}
              className={`wb-slideshow-dot${i === active ? " wb-slideshow-dot--active" : ""}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
