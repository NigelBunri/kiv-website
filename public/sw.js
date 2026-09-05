// Kingdom Impact Ventures offline support - app shell + already-visited
// pages. Mostly a marketing/informational site, so this covers the large
// majority of pages here (unlike KISTube, which has genuinely
// live/personalized content that can't work offline by design) - most
// pages served by this app aren't personalized per-visitor, so caching
// them for offline viewing is both safe and actually useful here.
// Exceptions that stay live-only: anything under /control (the
// authenticated partner dashboard - session-specific, and a stale cached
// copy could show another session's leftover UI state) and the Website
// Builder's public pages at /page/** (owner-editable, dynamic per
// visitor request). Both are excluded below.
//
// No new dependency (no Workbox) - hand-written, matching the sibling
// KISTube repo's identical approach (kept in sync deliberately; no
// shared-package setup between the two repos).
const CACHE_VERSION = "kiv-shell-v1";
// Cloudflare's static-asset layer strips .html extensions by default
// (confirmed on the sibling KISTube deployment: /offline.html
// 307-redirects to /offline) - using the extensionless path directly
// avoids caching a redirected Response, which behaves inconsistently
// when served back through respondWith().
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.ico",
  "/images/kiv-logo-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only same-origin GET requests. Cross-origin traffic (the Django
  // API, Cloudflare Insights, Turnstile) is left completely alone.
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Session-specific (/control) or owner-published-dynamic (/page/**)
  // content - never cache these. Falling through here (not calling
  // respondWith) lets the request proceed exactly as if this service
  // worker didn't exist.
  if (url.pathname.startsWith("/control") || url.pathname.startsWith("/page/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))),
    );
    return;
  }

  if (request.url.includes("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        return response;
      })),
    );
  }
});
