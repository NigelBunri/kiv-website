"use client";

import { useEffect, useRef } from "react";

/**
 * A thin gold progress bar pinned to the very top of the viewport, width
 * tied to how far down the page you've scrolled. Purely decorative/UX
 * feedback — reads the scroll position via rAF-throttled listener and
 * writes directly to the bar's own inline style (no React state/re-render
 * per scroll tick, which would be wasteful at 60fps).
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      if (barRef.current) {
        barRef.current.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={barRef} className="scroll-progress-bar" />
    </div>
  );
}
