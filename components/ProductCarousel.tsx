"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { products } from "@/lib/site";

const AUTOPLAY_MS = 4500;

// Shortest signed distance from `from` to `to` around a ring of `count`
// slots - e.g. with 5 products, going from index 4 to index 0 is +1 (the
// "next" direction), not -4, so the carousel always animates the short
// way around rather than spinning through every other card first.
function ringOffset(from: number, to: number, count: number): number {
  let diff = (to - from) % count;
  if (diff > count / 2) diff -= count;
  if (diff < -count / 2) diff += count;
  return diff;
}

export function ProductCarousel() {
  const count = products.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    setActive(((index % count) + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  return (
    <div
      className="product-carousel"
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Kingdom Impact Ventures products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node)) setPaused(false);
      }}
    >
      <h1 id="home-hero-title" className="sr-only">
        Kingdom Impact Ventures - KCAN, KIV, KIS and our product portfolio
      </h1>
      <div className="product-carousel-track">
        {products.map((product, index) => {
          const offset = ringOffset(active, index, count);
          const magnitude = Math.abs(offset);
          // Cards more than one slot away sit fully off to whichever side
          // they'd approach from, invisible and non-interactive - only
          // the active card and its immediate left/right neighbors are
          // ever meaningfully visible or focusable. data-offset picks one
          // of 5 fixed CSS rules in globals.css instead of computing an
          // inline style="" here - see that rule's comment for why "far"
          // only needs a direction, not the exact magnitude.
          const visible = magnitude <= 1;
          const dataOffset = magnitude <= 1 ? String(offset) : offset > 0 ? "far-right" : "far-left";
          return (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className={`product-carousel-card${offset === 0 ? " is-active" : ""}`}
              data-offset={dataOffset}
              aria-hidden={!visible}
              tabIndex={visible ? 0 : -1}
              onClick={(event) => {
                // A peeking side card is still a real link (keyboard/
                // screen-reader users can tab to and activate it
                // directly) but a mouse click on one should bring it to
                // center first, matching what clicking a preview card
                // visually promises, rather than immediately navigating
                // away from a card the visitor was still just previewing.
                if (offset !== 0) {
                  event.preventDefault();
                  goTo(index);
                }
              }}
            >
              <span className="product-carousel-logo">
                <Image src={`/images/${product.slug}-logo-512.png`} alt="" width={96} height={96} />
              </span>
              <strong>{product.fullName}</strong>
              <span className="product-carousel-name">{product.name}</span>
              <p>{product.summary}</p>
            </Link>
          );
        })}
      </div>

      <div className="product-carousel-controls">
        <button type="button" onClick={prev} aria-label="Previous product">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
        </button>
        <div className="product-carousel-dots" role="tablist" aria-label="Choose a product">
          {products.map((product, index) => (
            <button
              key={product.slug}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Show ${product.name}`}
              className={index === active ? "is-active" : ""}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        <button type="button" onClick={next} aria-label="Next product">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
