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

## Platform-scale features (added 2026-09-01)

A second build pass closed the gap to genuine YouTube-level functionality.
Everything below is wired to real, verified backend contracts — several
fixed/added server-side as part of this same pass (see "Backend
additions" further down).

- **Notifications** — `components/kistube/NotificationBell.tsx` (topbar
  dropdown, polls `/api/kistube/notifications/unread-count` every 45s) +
  `/kistube/notifications` (full history). Backed by `apps.notifications`,
  a global system shared with the rest of KIS (not KISTube-specific) —
  already fires for new-upload/comment-reply/reaction/went-live events in
  production, no backend work needed.
- **Playlists** — full CRUD for personal playlists
  (`/kistube/playlists`, `/kistube/playlist/[id]`, `CreatePlaylistForm`,
  `SaveToPlaylistMenu` on the watch page) plus read-only browsing of
  channel playlists. Reorder, shuffle (channel playlists), and
  public/unlisted sharing all work.
- **Live streaming** — `components/kistube/LiveWatchPanel.tsx`, dropped
  into the watch page when `content.content_type === "live_stream"`.
  Status-aware (scheduled countdown / live+chat+viewer-count / ended
  falls through to normal VOD since the backend auto-archives ended
  streams into a regular `ChannelContent` video row). **Video playback
  itself does not work today** — `ChannelLiveStream.playback_url` is a
  dead placeholder because no provider is configured
  (`LIVE_STREAM_PROVIDER=disabled`, no Mux credentials). The panel is
  fully data-driven against the real fields, so it starts actually
  playing the moment a provider is configured — zero frontend changes
  needed then. This is a business decision (pay for Mux, or stand up a
  media server), not a code gap.
- **Trending / Categories / Search** — `/kistube/trending` (real
  engagement+time-decay ranking, not just a sort order),
  `/kistube/categories` + `/kistube/category/[slug]`, and search now has
  a working `sort` param (views/oldest/relevance) plus a debounced
  autocomplete box (`SearchAutocomplete.tsx`, wired into the topbar).
- **Recommendations** — signed-in home page shows a real
  weighted-hybrid "Recommended for you" row
  (`GET /broadcasts/recommendations/`).
- **Channel pages** — tabs (Videos/Playlists/Community/About via
  `?tab=`), a live-now banner, homepage shelves (curated rows, currently
  empty on every channel since none has created one), membership tiers
  with a real Join flow (free tiers activate immediately, paid tiers
  redirect to Stripe/Flutterwave checkout), and a community feed
  (text/rich_text posts + working poll voting — these ARE
  `ChannelContent` rows with `content_type="text"/"rich_text"/"poll"`,
  same publish pipeline as videos, not a separate system).
- **Watch page** — chapters, closed-caption `<track>` elements, cards
  (rendered as a list, not time-synced overlays — see below), a
  transcript panel, an audio-track list, shopping-tag links, clip
  creation (`CreateClipButton`) + a public-clips row for that video,
  tipping ("Super Thanks", redirect-to-pay), download, add-to-queue
  (`/kistube/queue`), a premiere countdown, and a geo-restriction notice.

**Scoping notes worth knowing before touching this code:**
- Chapters/cards/product-tags/audio-tracks render as plain informational
  lists, not player-synced overlays triggered at specific timestamps —
  doing that would need a shared ref into the `<video>` element, which
  lives in a sibling component these don't have access to. If real
  time-sync is wanted later, it needs a refactor that lifts video-element
  control into a shared context.
- Live chat is REST-polling (`components/kistube/LiveWatchPanel.tsx`
  polls every 4s), not real-time. NestJS's live-stream socket handler
  (`realtime/handlers/live.ts`) only relays viewer-count, never chat
  messages — deliberately not touched, since the realtime/call gateway is
  delicate (see the KIS Call System memory).
- No global "my clips" page — `ChannelContentClipView` GET is per-video
  only, no endpoint lists a user's clips across every video they've
  clipped from.
- No channel-trailer display — `trailer_content`/`featured_content` are
  real, settable fields but **no serializer anywhere exposes them for
  reading** — effectively write-only today. Needs a small backend
  addition (expose the two fields somewhere readable) before it's
  buildable.
- No poll-creation composer — voting on existing polls works fully;
  creating one is a `/control/channel` content-editor concern that
  doesn't have content-type-specific UI yet.

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

### Backend additions made for the platform-scale pass

All in `apps/broadcasts` (`~/dev/backend/kis`), tested, deployed:

- Channel-playlist-contents GET (`GET /broadcasts/playlists/{id}/items/`)
  — previously only playlist *titles* were listable via the channel
  playlists endpoint; there was no way to see what was inside one.
- `shuffle_enabled` added to `BroadcastPlaylistSerializer` — the model
  field and the PATCH-to-toggle endpoint both existed, but the serializer
  silently dropped it from every response.
- User-playlist item reorder (`PATCH .../user-playlists/{id}/items/`)
  and public sharing (`GET .../user-playlists/{id}/public/`) — the
  `visibility` field existed on `UserContentPlaylist` since it was added,
  but no view ever read it for access control (every lookup was
  hard-scoped to the owner).
- Comment-replies-fetch (`GET /broadcasts/channel-comments/{id}/replies/`)
  — `reply_count` was always shown on a comment; the replies themselves
  were never fetchable through any endpoint.
- Fixed the `sort` param on global search (`GET /broadcasts/search/`) —
  it was read but silently ignored, always ordering `-published_at`
  regardless of value. Now supports `views` (real) and `oldest`.
- Search-suggest/autocomplete (`GET /broadcasts/search/suggest/`) — didn't
  exist at all before.
- `ChannelContentPollVote` model + vote/results endpoint
  (`GET/POST /broadcasts/channel-contents/{id}/poll/`) for
  `content_type="poll"` community posts — poll options already lived in
  `content.metadata["poll"]` (writable via the existing content PATCH),
  only per-user vote tracking was missing.
- Seeded `ChannelCategory` with 12 top-level categories — the model and
  its list/browse endpoints existed since migration 0046, nothing had
  ever populated the table.
- Flipped 6 read-only player-feature GET endpoints from `IsAuthenticated`
  to `AllowAny`: watch-segments (heatmap), audio-tracks, geo-restriction,
  premiere, transcript, product tags. Anonymous viewers need these same
  as signed-in ones; every write path on these views already had its own
  manual role/ownership check, unaffected by this.

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
