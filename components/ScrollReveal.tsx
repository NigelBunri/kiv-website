"use client";

import { useEffect } from "react";

/**
 * Progressive-enhancement scroll-reveal, safe-by-default: [data-reveal]
 * elements have NO hidden state in plain CSS (see globals.css) — they are
 * fully visible unless THIS effect explicitly hides one. That means if this
 * script never runs at all (disabled JS, a CSP quirk, a hydration failure
 * in this Vite/RSC setup, an ad blocker, anything), every element simply
 * stays at its default fully-visible state. The previous version hid
 * elements via a class set by a separate inline <script> in layout.tsx and
 * revealed them here — if that inline script and this effect ever
 * disagreed (e.g. the inline script ran but this effect didn't, for
 * whatever reason), content was stuck invisible. This version can only
 * ever fail toward "no animation," never toward "empty-looking page."
 */
export function ScrollReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!elements.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-pending");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    for (const el of elements) {
      // Only defer elements not already in/near the viewport at mount —
      // avoids a hidden-then-shown flash for above-the-fold content, and
      // means "reveal-pending" (the only class with any hidden styling) is
      // never applied to something this same effect isn't about to reveal.
      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (!alreadyVisible) {
        el.classList.add("reveal-pending");
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
