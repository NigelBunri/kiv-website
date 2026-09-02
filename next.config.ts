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
  "frame-src https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://cloudflareinsights.com",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // No `output: "standalone"` here: @opennextjs/cloudflare builds its Worker
  // bundle from the regular .next server output, not the pruned standalone
  // one, and the two are not interchangeable (see docs/deployment.md for
  // what this means for the Docker path).
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;

// Lets `next dev` access Cloudflare bindings (env vars, KV, D1, etc.) the
// same way the deployed Worker does. No-op in production/build.
initOpenNextCloudflareForDev();
