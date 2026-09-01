# KISTube

KISTube is the public web surface for the video/broadcast side of the KIS
app, living at `/kistube` inside this site. It is not a separate product,
not a separate backend, and not a separate auth system — it's a UI layer
over `apps.broadcasts` and the handful of other existing Django apps
(`apps.health_ops`, `apps.commerce.business_*`, `apps.education`,
`apps.testimony`, `apps.accounts.responsible_feed`) that already model
this content. Same session cookie, same tiers, same moderation.

## Sections

Education · Health · Market · Jobs · Feeds · Testimonies · Channels, plus
the usual video-platform furniture: Subscriptions, Saved, History, You,
Search, and per-channel/per-video pages.

## Layout

- `app/kistube/layout.tsx` — fetches the signed-in viewer, their
  subscriptions preview, and today's responsible-feed watch-time status
  once per request (`lib/kistube-viewer.ts`'s `getKisTubeSidebarData()`),
  then wraps every `/kistube/**` page in `components/kistube/KISTubeShell.tsx`
  (topbar with search + profile menu, sidebar nav + subscriptions +
  watch-time panel, mobile drawer/bottom-nav variants).
- `app/kistube/kistube.css` — scoped stylesheet (`.kt-*` classes), imported
  only by the layout so it can never regress the rest of the site.
- `app/kistube/manifest.webmanifest/route.ts` — a **Route Handler**, not a
  `manifest.ts` file convention. Next's `manifest.ts` special file only
  generates a route at the app root; a nested `app/kistube/manifest.ts`
  was tried first and confirmed (via `next build`'s route list) to
  produce no route at all, so it's a hand-written Route Handler instead.
  This is what lets "Add to Home Screen" from within KISTube pin KISTube
  itself (own name/icon/start_url/scope) rather than the parent
  Kingdom Impact Ventures manifest.

## Data layer

- `lib/kistube-api.ts` — server-side, **unauthenticated** Django fetchers
  for public data (channel/content lists, public channel/content landing
  payloads, search, market discovery, testimonies, health discovery, the
  broadcasts sitemap plan). Plain `fetch`, `cache: "no-store"`, returns
  `null`/`[]` on failure rather than throwing — every caller goes straight
  to `notFound()` or an empty state.
- `lib/kistube-viewer.ts` — the one place that fetches the signed-in
  viewer's identity, subscriptions and feed status together
  (`getKisTubeSidebarData()`), used by the layout. Individual pages that
  need their own authenticated data (Subscriptions, Saved, History, You,
  Education, Jobs, Feeds) call Django **directly** from their Server
  Component via `lib/session.ts`'s `getValidSession()`/`authHeaders()`/
  `kisApiBase()` — never through this site's own `/api/kistube/**` routes,
  since that would be a self-referential HTTP hop from a Server Component.
- `app/api/kistube/**` — Route Handlers exist only for **write actions**
  triggered by client-side interactivity (subscribe, react, comment, save,
  view-credit, feed-heartbeat, job-apply, testimony-endorse) and for the
  couple of GETs a Client Component needs after mount. Most proxy through
  `lib/controlProxy.ts`'s `proxyToDjango()`; a few (comments GET,
  view-event POST, `/me`) are custom handlers because their Django
  counterpart is `AllowAny` and must keep working for signed-out visitors,
  where `proxyToDjango()` would hard-401.
- `lib/kistube-format.ts` — `formatDuration`/`formatCount`/`formatRelativeTime`.
- `lib/kistube-deeplink.ts` — builds `https://kis.app/...` URLs matching
  `apps/websites/kis_content_resolvers.py`'s existing deep-link grammar,
  fed into `components/website-builder/OpenInApp.tsx` (already built to
  convert that into the native `kis://` scheme) on channel and watch pages.

## SEO / indexing

Mirrors the backend's own default-off indexing stance
(`KIS_PUBLIC_WEB_INDEXING_ENABLED`, default `False`) rather than indexing
eagerly: `lib/kistube-metadata.ts`'s `kistubeIndexingEnabled()` reads
`NEXT_PUBLIC_KISTUBE_INDEXING_ENABLED` (default unset/off), and
`kistubeRobots()` is applied to every page's metadata. Per-channel and
per-content pages additionally respect the backend's own per-item
`seo.robots` value from the public landing payloads. `app/sitemap.ts`
appends the static KISTube section routes plus, only when indexing is on
**and** the backend's sitemap-plan (`PublicSitemapPlanView`) reports
`indexing_enabled`, the dynamic channel/content URLs — parsed from the
upstream `kis.app`-prefixed path segments back into this site's own
`/kistube/channel/{handle}` and `/kistube/watch/{id}` canonical URLs.

To turn indexing on: set `NEXT_PUBLIC_KISTUBE_INDEXING_ENABLED=true` here
**and** flip `KIS_PUBLIC_WEB_INDEXING_ENABLED=true` on the backend — both
sides gate independently, by design.

## Responsible engagement

The Feeds page and the sidebar watch-time panel both read the same
server-authoritative daily limit (`apps.accounts.responsible_feed`,
2h/day default) — the backend enforces it (returns empty results +
`feed_limit.limit_reached: true` once hit), the frontend only displays it.
There is no client-side workaround; the elapsed-time value a client might
report is ignored server-side.

## Backend additions made for KISTube

Two small, additive-only Django changes, both with tests, both following
existing conventions exactly:

1. `MyChannelSubscriptionsView` (`apps/broadcasts/views.py`,
   `GET /api/v1/broadcasts/my-subscriptions/`) — the app had per-channel
   subscribe/unsubscribe and a "who's subscribed to this channel" view,
   but no "list the channels *I* subscribe to" endpoint, which the
   Subscriptions page and sidebar both need.
2. `HealthInstitution.is_public` (`apps/health_ops/models.py`) +
   `HealthDiscoveryView` (`GET /api/v1/health-ops/discovery/`) — opt-in,
   not opt-out (default `False`). `HealthInstitution` had no public/private
   visibility concept at all before this; a naive "list all active
   institutions" endpoint would have surfaced every institution publicly
   with no owner consent. `HealthInstitutionPublicSerializer` is a
   separate minimal serializer (`id, name, slug, institution_type,
   created_at` only) — it never reuses `HealthInstitutionSerializer`,
   which exposes owner/payout/settings fields.

## What's intentionally out of scope

- No dedicated detail pages for Market products/services or Education
  courses — those render as informational tiles on `/kistube/market` and
  `/kistube/education` (matching what the underlying discovery endpoints
  return today), not as new routes with their own URLs. Adding those is a
  bigger scope decision (permissions, checkout flow, review UI) than this
  build covers.
- The Feeds page renders the raw responsible-engagement feed
  (`BroadcastFeedView`) defensively/generically, since that endpoint mixes
  several different backend source types with different field shapes.
- No `kis.app` universal-link infra (`apple-app-site-association`,
  `assetlinks.json`) exists yet, so `OpenInApp` uses the `kis://` custom
  scheme, not a true universal link — see `OpenInApp.tsx`'s own comment.
