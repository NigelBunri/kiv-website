"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type TabNavItem = {
  href: string;
  label: string;
  active?: boolean;
  /** Overrides the default plain <Link> for this item - used by the
   * storefront nav's mega-menu flyout items, which need extra markup
   * (a hover/focus flyout card) around the link rather than just the
   * link itself. */
  render?: () => React.ReactNode;
};

// A horizontally-scrollable row of page tabs for the desktop/tablet header
// - used whenever there are enough pages that they wouldn't all
// comfortably fit at once (the main site's own nav has 7; a storefront
// with several pages hits this too). Capped to roughly fit ~5 tabs via
// max-width regardless of viewport width, so it behaves the same on an
// ultra-wide monitor as it does right before the hamburger breakpoint -
// beyond that, scrolling (drag, touch swipe, or the arrow buttons) reveals
// the rest, with an edge fade + arrow indicating there's more in that
// direction. As the container itself narrows (approaching the hamburger
// breakpoint), fewer tabs fit naturally - no separate step logic needed,
// the same scroll/arrow behavior just kicks in earlier.
type Props = {
  items: TabNavItem[];
  ariaLabel: string;
  /** Applied to the scrollable track alongside scroll-tab-track, so a
   * consumer's existing link styling (e.g. "primary-nav" or
   * "wb-site-nav wb-site-nav--desktop") keeps applying unchanged - this
   * component only adds scroll/drag/arrow structure, never link visuals. */
  trackClassName?: string;
};

export function ScrollableTabNav({ items, ariaLabel, trackClassName }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const dragState = useRef<{ startX: number; startScrollLeft: number; dragging: boolean; moved: boolean } | null>(null);

  function updateEdges() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    // ResizeObserver only fires when the track's OWN box size changes - it
    // stays silent when only its *content* reflows without the box itself
    // resizing, which is exactly what happens when a web font finishes
    // loading after the track was first measured against a fallback font's
    // (narrower) metrics: real overflow can appear with nothing to trigger
    // a recheck. window resize is a second gap ResizeObserver alone won't
    // always catch consistently across browsers. Covering both is what
    // makes the arrows reliably show up instead of silently staying off.
    document.fonts?.ready?.then(updateEdges).catch(() => {});
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
      window.removeEventListener("resize", updateEdges);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // Pages by nearly the full visible width per click - a deliberate "next
  // slide" jump rather than a small nudge, so a single click's effect is
  // obvious. A little overlap (48px) is kept so the row doesn't jump so far
  // that the reader loses their place relative to the tabs they just saw.
  function scrollByPage(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth - 48, 80);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  // Click-and-drag scrolling for desktop mouse users - touch devices
  // already get native swipe scrolling for free from overflow-x:auto.
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (!el || event.pointerType === "touch") return;
    dragState.current = { startX: event.clientX, startScrollLeft: el.scrollLeft, dragging: true, moved: false };
    el.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    const state = dragState.current;
    if (!el || !state?.dragging) return;
    const delta = event.clientX - state.startX;
    el.scrollLeft = state.startScrollLeft - delta;
    // Whether a pointer-down-then-up counts as a "drag" (which suppresses
    // the click's navigation via onClickCapture below) is judged by
    // whether the track actually scrolled - not by raw cursor movement.
    // A nav with few enough tabs to fit with no overflow (the common case
    // for a freshly-built site with only 2-3 pages) has nothing to
    // scroll: el.scrollLeft stays clamped at 0 no matter how far the
    // cursor moves. Judging by cursor delta alone (the previous approach)
    // meant ordinary click jitter on exactly those non-scrollable navs
    // got misread as a drag and had its navigation suppressed - every tab
    // effectively unclickable - even though nothing ever moved on screen.
    if (Math.abs(el.scrollLeft - state.startScrollLeft) > 2) state.moved = true;
  }
  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (el && dragState.current?.dragging) {
      try { el.releasePointerCapture(event.pointerId); } catch { /* already released */ }
    }
    dragState.current = dragState.current ? { ...dragState.current, dragging: false } : null;
  }
  // A drag that actually moved the scroll position shouldn't also fire the
  // link it started on - mousedown-then-drag-then-mouseup over a <Link>
  // would otherwise navigate unexpectedly.
  function onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (dragState.current?.moved) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  return (
    <div className="scroll-tab-nav">
      {canScrollLeft && (
        <button type="button" className="scroll-tab-arrow scroll-tab-arrow--left" onClick={() => scrollByPage(-1)} aria-label="Show earlier pages">‹</button>
      )}
      <div
        ref={trackRef}
        className={`scroll-tab-track${trackClassName ? ` ${trackClassName}` : ""}${canScrollLeft ? " has-fade-left" : ""}${canScrollRight ? " has-fade-right" : ""}`}
        role="navigation"
        aria-label={ariaLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={onClickCapture}
      >
        {items.map((item) =>
          item.render ? (
            <div key={item.href} className="scroll-tab-item">{item.render()}</div>
          ) : (
            <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined}>
              {item.label}
            </Link>
          ),
        )}
      </div>
      {canScrollRight && (
        <button type="button" className="scroll-tab-arrow scroll-tab-arrow--right" onClick={() => scrollByPage(1)} aria-label="Show more pages">›</button>
      )}
    </div>
  );
}
