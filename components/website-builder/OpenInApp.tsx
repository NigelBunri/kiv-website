"use client";

import { useEffect, useState } from "react";
import { productBySlug } from "@/lib/site";

// Converts the backend's universal-link deep_link (https://kis.app/...,
// from apps/websites/kis_content_resolvers.py) into the kis:// custom
// scheme registered natively on both platforms (ios/KIS/Info.plist,
// android/app/src/main/AndroidManifest.xml). The custom scheme is used
// for the actual open-attempt rather than the https:// form because
// kis.app doesn't yet serve apple-app-site-association/assetlinks.json —
// without those, an https:// "universal link" is just a normal page
// navigation the OS won't hand to the app, whereas an unrecognized custom
// scheme fails silently, which is what the timeout-fallback below depends on.
function toCustomScheme(deepLink: string): string {
  try {
    const url = new URL(deepLink);
    return `kis://${url.pathname.replace(/^\//, "")}${url.search}`;
  } catch {
    return "";
  }
}

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "desktop";
}

// Renders nothing on desktop — BuyButton already gives PC visitors a full
// on-site checkout/login flow there (see BuyButton.tsx), so a phone-only
// app-open button next to it would be redundant clutter. On a phone, this
// is the primary action: try the native app first, and only fall back to
// a store listing (once KIS ships and NEXT_PUBLIC_KIS_GOOGLE_PLAY_URL /
// NEXT_PUBLIC_KIS_APP_STORE_URL are configured) or /download in the
// meantime, rather than a dead store link.
export function OpenInApp({ deepLink, label = "Open in the KIS app" }: { deepLink: string; label?: string }) {
  const [platform, setPlatform] = useState<Platform>("desktop");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  if (platform === "desktop" || !deepLink) return null;

  const kis = productBySlug("kis");
  const storeUrl = platform === "ios" ? kis?.availability?.appStoreUrl : kis?.availability?.googlePlayUrl;
  const storeReady = platform === "ios" ? kis?.availability?.ios : kis?.availability?.android;

  function handleClick() {
    const scheme = toCustomScheme(deepLink);
    if (!scheme) return;
    const fallbackUrl = storeReady && storeUrl ? storeUrl : "/download";
    const openedAt = Date.now();
    window.location.href = scheme;
    setTimeout(() => {
      // The tab going to background means iOS/Android actually switched to
      // the app — don't fire the fallback navigation on top of that.
      if (document.hidden) return;
      if (Date.now() - openedAt < 2500) {
        window.location.href = fallbackUrl;
      }
    }, 1800);
  }

  return (
    <button type="button" className="wb-button wb-open-in-app" onClick={handleClick}>
      {label}
    </button>
  );
}
