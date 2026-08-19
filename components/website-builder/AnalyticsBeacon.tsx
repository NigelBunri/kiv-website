"use client";

// Fires one page-view beacon per mount via navigator.sendBeacon (falls
// back to fetch with keepalive when unavailable) — no third-party
// script, no cookie, nothing persisted client-side. See
// apps.websites.analytics on the backend for what's actually stored.
import { useEffect } from "react";

export function AnalyticsBeacon({ siteSlug, pageSlug }: { siteSlug: string; pageSlug: string }) {
  useEffect(() => {
    const payload = JSON.stringify({
      site_slug: siteSlug,
      page_slug: pageSlug,
      referrer: document.referrer || "",
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/website-analytics", blob);
      return;
    }

    fetch("/api/website-analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [siteSlug, pageSlug]);

  return null;
}
