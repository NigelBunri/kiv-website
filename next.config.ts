import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 'unsafe-eval' is added to script-src in dev only: Next's dev-mode runtime
// (Turbopack/React Refresh) calls eval() to reconstruct cross-environment
// call stacks and isn't used at all in production ("React will never use
// eval() in production mode" - from the console error this produces
// without it). Excluding it in prod was confirmed safe by monitoring
// securitypolicyviolation/console across page load, scroll-triggered
// reveal animations and client-side navigation - nothing there depends on
// eval()/Function() construction.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === "production" ? [] : ["'unsafe-eval'"]),
  "https://challenges.cloudflare.com",
  // Cloudflare injects its own Web Analytics beacon into the served HTML
  // at the edge (outside this app's control) whenever it's enabled on the
  // zone - without this, every single page load logs a blocked-by-CSP
  // console error for a script this app never requested.
  "https://static.cloudflareinsights.com",
].join(" ");

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: https:",
  // No media-src previously meant <video>/<audio> elements fell back to
  // default-src 'self' - silently blocking every KISTube video/audio
  // whose src points off-domain (S3/Django media, e.g.
  // https://s3.eu-west-2.amazonaws.com/kis-production-media-.../*.mp4).
  // Images used plain <img src> tags, which img-src's https: already
  // covered, so only playback broke - matching "images and videos work
  // in the app but videos don't play on KISTube" exactly. blob: is for
  // any future MediaSource/HLS.js-based player.
  "media-src 'self' https: blob:",
  "font-src 'self' data:",
  // 'unsafe-inline' is a hard requirement, not a default left in by habit:
  // Next's App Router streams RSC/hydration data via multiple inline
  // <script> tags (confirmed empirically - removing this broke all
  // client-side interactivity site-wide, since React never received the
  // payload to hydrate against).
  // challenges.cloudflare.com is required for the Turnstile CAPTCHA widget
  // (PublicForm.tsx injects its script tag directly) - without this, the
  // widget script and its challenge iframe would both be silently blocked.
  `script-src ${scriptSrc}`,
  // Mirrors script-src: covers the same inline RSC/hydration <script>
  // elements and the Turnstile script tag under the more specific Level 3
  // directive, for browsers that honor it over the legacy script-src.
  `script-src-elem ${scriptSrc}`,
  // No inline event-handler attributes (onclick=, etc.) are used anywhere
  // in this codebase - React attaches listeners via addEventListener, not
  // HTML attributes - so this can be locked down independently of
  // script-src's 'unsafe-inline'.
  "script-src-attr 'none'",
  // challenges.cloudflare.com is the Turnstile widget (see above). The rest
  // are the website-builder's embed providers (EMBED_URL_PATTERNS in
  // components/website-builder/SectionRenderer.tsx) - without these, every
  // YouTube/Vimeo/Calendly/Google Maps/Calendar/Spotify/Loom embed a
  // partner adds to their page silently fails to render, blocked by this
  // same directive.
  "frame-src https://challenges.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://calendly.com https://www.google.com https://calendar.google.com https://open.spotify.com https://www.loom.com",
  "style-src 'self' 'unsafe-inline'",
  "style-src-elem 'self' 'unsafe-inline'",
  // Inline style="" attributes are used throughout (dynamic layout values
  // computed at render time) - 'unsafe-inline' here is required for the
  // same reason it's required for style-src.
  "style-src-attr 'self' 'unsafe-inline'",
  "connect-src 'self' https://cloudflareinsights.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  // Superseded by the more specific frame-src/worker-src above in browsers
  // that support them (both do) - kept only for the validator/legacy UAs
  // that fall back to it, so its value doesn't need to repeat every embed
  // host from frame-src.
  "child-src 'self' https://challenges.cloudflare.com",
  "upgrade-insecure-requests",
].join("; ");

const permissionsPolicy = [
  "accelerometer=()",
  // wb-embed (SectionRenderer.tsx) lets website-builder owners embed
  // YouTube/Vimeo/Spotify/Loom iframes with allow="autoplay;
  // encrypted-media; picture-in-picture" and allowFullScreen - those are
  // cross-origin (youtube.com etc.), so restricting to (self) here would
  // silently defeat the iframe's own allow attribute and break playback.
  "autoplay=*",
  "bluetooth=()",
  "camera=()",
  "clipboard-read=()",
  // Used by app/control/partner/invites/InvitesManager.tsx ("copy invite
  // code") - same-origin only, so (self) doesn't affect the embed iframes.
  "clipboard-write=(self)",
  "display-capture=()",
  "encrypted-media=*",
  "fullscreen=*",
  "geolocation=()",
  "gyroscope=()",
  "hid=()",
  "idle-detection=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "picture-in-picture=*",
  "screen-wake-lock=()",
  "serial=()",
  "usb=()",
  "xr-spatial-tracking=()",
].join(", ");

const nextConfig: NextConfig = {
  // No `output: "standalone"` here: @opennextjs/cloudflare builds its Worker
  // bundle from the regular .next server output, not the pruned standalone
  // one, and the two are not interchangeable (see docs/deployment.md for
  // what this means for the Docker path).
  poweredByHeader: false,
  async redirects() {
    return [
      // KISTube moved to its own standalone deployment
      // (kistube.kingdomimpactventures.org, github.com/NigelBunri/kistube-website).
      // Preserves bookmarks/shared links/existing SEO for the old
      // kingdomimpactventures.org/kistube/... URLs rather than 404ing them.
      {
        source: "/kistube",
        destination: "https://kistube.kingdomimpactventures.org",
        permanent: true,
      },
      {
        source: "/kistube/:path*",
        destination: "https://kistube.kingdomimpactventures.org/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: permissionsPolicy },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Legacy mirror of the CSP's frame-ancestors 'none' above - CSP
          // wins in modern browsers, this covers the handful of older
          // browsers/scanners that only recognize the deprecated header.
          { key: "X-Frame-Options", value: "DENY" },
          // Safe with this site's auth flow: no window.open()/window.opener
          // usage anywhere in the codebase (grepped), so isolating the
          // browsing context group can't break a popup-based OAuth dance
          // that doesn't exist here.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
          // "credentialless", not "require-corp": require-corp would need
          // every cross-origin subresource (Turnstile's challenge iframe/
          // script, Cloudflare's injected analytics beacon, S3/Django media)
          // to send a matching CORP header, which this app doesn't control.
          // credentialless instead just strips credentials from those
          // requests - safe here because nothing in this codebase makes a
          // credentialed (cookie-bearing) cross-origin fetch (grepped for
          // `credentials:` - none), so there's nothing to break.
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;

// Lets `next dev` access Cloudflare bindings (env vars, KV, D1, etc.) the
// same way the deployed Worker does. No-op in production/build.
initOpenNextCloudflareForDev();
