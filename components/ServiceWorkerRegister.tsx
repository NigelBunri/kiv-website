"use client";

import { useEffect } from "react";

// Renders nothing - just registers public/sw.js once on mount so the
// app shell + already-visited pages stay available offline (see sw.js's
// own header comment for the exact caching strategy and what's
// deliberately excluded). Guarded by the feature-detect since not every
// browser supports service workers, and registration failing should
// never break the app itself.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed", error);
    });
  }, []);
  return null;
}
