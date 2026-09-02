// Server-side fetch layer for KISTube's public/consumer surface. Follows
// the exact pattern established by lib/website-builder-api.ts: plain
// unauthenticated GETs are called directly from Server Components
// (server-to-server, no CORS concern, cache: "no-store" since broadcast
// content changes without a rebuild); every export returns `null`/`[]` on
// any failure rather than throwing, so callers go straight to notFound()
// or an empty state without a try/catch at every call site.
//
// Authenticated actions (subscribe, save, react, comment, heartbeat) do
// NOT belong in this file — those go through app/api/kistube/** Route
// Handlers using lib/controlProxy.ts's proxyToDjango(), exactly like
// every app/api/control/** route already does. This file is read-only.
const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

function apiBase(): string {
  return (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
      ...init,
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error("kistube-api: upstream request failed", url, error);
    return null;
  }
}

// ── Shared shapes (apps.broadcasts) ─────────────────────────────────────

export type ChannelOwnerType = "user" | "shop" | "health" | "education" | "partner";

export type ChannelSummary = {
  id: string;
  handle: string;
  display_name: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  owner_type: ChannelOwnerType;
  category?: string;
  is_verified: boolean;
  subscriber_count: number;
  content_count: number;
  is_subscribed?: boolean;
  [key: string]: unknown;
};

export type ChannelListResponse = { results: ChannelSummary[]; next_cursor: string | null };

export type ContentType =
  | "video" | "short_video" | "image" | "gallery" | "text" | "rich_text"
  | "audio" | "document" | "link" | "poll" | "event" | "live_stream" | "replay";

export type ContentCard = {
  id: string;
  title: string;
  description?: string;
  content_type: ContentType;
  thumbnail_url?: string;
  duration_seconds: number | null;
  published_at: string | null;
  channel: { id: string; handle: string; display_name: string; avatar_url?: string; is_verified?: boolean };
  engagement_counts?: { views: number; shares: number; comments: number; reactions: number };
  [key: string]: unknown;
};

export type ContentListResponse = { results: ContentCard[]; next_cursor: string | null };

export type PublicChannelPayload = {
  type: "channel";
  id: string;
  handle: string;
  display_name: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  category?: string;
  language?: string;
  country?: string;
  subscriber_count: number;
  content_count: number;
  trust_badges?: string[];
  url: string;
  seo: { title: string; description: string; canonical_url: string; robots: string };
  share_card: { title: string; description: string; image?: string; url: string };
  growth?: { referrals_enabled: boolean; invite_url: string };
  report: { method: string; url: string };
  latest_contents: ContentCard[];
};

// Matches apps/broadcasts/views.py _safe_public_content_asset() exactly -
// no `id` field (it's not part of the public-safe projection).
export type ContentAsset = {
  asset_type: string;
  url: string;
  thumbnail_url?: string;
  mime_type: string;
  caption?: string;
  width?: number;
  height?: number;
  duration_seconds?: number;
};

export type PublicContentPayload = {
  type: "content";
  id: string;
  title: string;
  description?: string;
  content_type: ContentType;
  thumbnail_url?: string;
  // {} (not null) when the content has no asset row - check asset.url.
  asset: Partial<ContentAsset>;
  channel: Omit<PublicChannelPayload, "latest_contents">;
  url: string;
  seo: { title: string; description: string; canonical_url: string; robots: string };
  share_card: { title: string; description: string; image?: string; url: string };
  embed: { oembed_url?: string; enabled: boolean; requires_policy_check?: boolean };
  report: { method: string; url: string };
};

export type CommentEntry = {
  id: string;
  content: string;
  user: string;
  user_display: string;
  body: string;
  parent: string | null;
  is_pinned: boolean;
  like_count: number;
  is_liked: boolean;
  reply_count: number;
  created_at: string;
};

// ── Channels & content (public, AllowAny) ───────────────────────────────

export async function fetchChannelList(params: {
  q?: string; ownerType?: ChannelOwnerType; category?: string; limit?: number; offset?: number;
}): Promise<ChannelListResponse | null> {
  const url = new URL(`${apiBase()}/api/v1/broadcasts/channels/`);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.ownerType) url.searchParams.set("owner_type", params.ownerType);
  if (params.category) url.searchParams.set("category", params.category);
  url.searchParams.set("limit", String(params.limit ?? 24));
  if (params.offset) url.searchParams.set("offset", String(params.offset));
  return fetchJson<ChannelListResponse>(url.toString());
}

export async function fetchPublicChannel(handle: string): Promise<PublicChannelPayload | null> {
  return fetchJson<PublicChannelPayload>(`${apiBase()}/api/v1/broadcasts/public/channels/${encodeURIComponent(handle)}/`);
}

export async function fetchChannelContents(
  channelId: string,
  params: { type?: string; q?: string; sort?: "new" | "oldest" | "top"; limit?: number; offset?: number } = {},
): Promise<ContentListResponse | null> {
  const url = new URL(`${apiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channelId)}/contents/`);
  if (params.type) url.searchParams.set("type", params.type);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.sort) url.searchParams.set("sort", params.sort);
  url.searchParams.set("limit", String(params.limit ?? 24));
  if (params.offset) url.searchParams.set("offset", String(params.offset));
  return fetchJson<ContentListResponse>(url.toString());
}

export async function fetchPublicContent(contentId: string): Promise<PublicContentPayload | null> {
  return fetchJson<PublicContentPayload>(`${apiBase()}/api/v1/broadcasts/public/contents/${encodeURIComponent(contentId)}/`);
}

export async function fetchRelatedContent(contentId: string): Promise<ContentCard[]> {
  const data = await fetchJson<{ results: ContentCard[] } | ContentCard[]>(
    `${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/related/`,
  );
  if (!data) return [];
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchContentComments(contentId: string, limit = 50): Promise<CommentEntry[]> {
  const data = await fetchJson<{ results: CommentEntry[] } | CommentEntry[]>(
    `${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/comments/?limit=${limit}`,
  );
  if (!data) return [];
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function recordContentView(contentId: string): Promise<void> {
  // AllowAny, fire-and-forget — increments stats.views and (if the
  // request carries an authenticated session) upserts ChannelWatchHistory
  // server-side. This helper is only ever called from a Route Handler
  // that already validated the viewer, since anonymous view credit still
  // needs to reach Django from *some* server context. See
  // app/api/kistube/contents/[id]/view/route.ts.
  await fetchJson(`${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/view/`, { method: "POST" });
}

export type BroadcastSearchResponse = { count: number; page: number; page_size: number; results: ContentCard[] };

export async function searchBroadcastContent(params: {
  q: string; type?: string; channelId?: string; page?: number; sort?: "relevance" | "views" | "oldest";
}): Promise<BroadcastSearchResponse | null> {
  const url = new URL(`${apiBase()}/api/v1/broadcasts/search/`);
  url.searchParams.set("q", params.q);
  if (params.type) url.searchParams.set("type", params.type);
  if (params.channelId) url.searchParams.set("channel_id", params.channelId);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.sort) url.searchParams.set("sort", params.sort);
  return fetchJson<BroadcastSearchResponse>(url.toString());
}

export type SearchSuggestResponse = {
  channels: { id: string; handle: string; display_name: string }[];
  contents: { id: string; title: string }[];
};

// Debounced client-side calls hit this through app/api/kistube/search-suggest
// (a thin proxy, since this fires from a Client Component) - exported here
// too for potential server-side use.
export async function fetchSearchSuggestions(q: string): Promise<SearchSuggestResponse | null> {
  const url = new URL(`${apiBase()}/api/v1/broadcasts/search/suggest/`);
  url.searchParams.set("q", q);
  return fetchJson<SearchSuggestResponse>(url.toString());
}

// ── Trending (apps.broadcasts, public, AllowAny) ────────────────────────
// A genuinely distinct engagement+time-decay ranked list, not just a sort
// order on the search endpoint - the backend scores
// (views + reactions*3 + comments*5 + shares*4) / (age_hours+2)^1.5. Its
// own hand-built item shape is NOT the same as ChannelContentListSerializer
// (flat view_count/reaction_count/comment_count, channel.name instead of
// display_name, no engagement_counts/is_verified) - toContentCard() below
// adapts it to the shared ContentCard type so <ContentCard> still works.

export type TrendingItem = {
  id: string;
  title: string;
  description?: string;
  content_type: ContentType;
  thumbnail_url?: string;
  duration_seconds: number | null;
  view_count: number;
  reaction_count: number;
  comment_count: number;
  published_at: string | null;
  channel: { id: string; name: string; handle: string; avatar_url?: string };
};

export type TrendingResponse = { count: number; results: TrendingItem[] };

export async function fetchTrending(params: { days?: number; limit?: number; offset?: number; contentType?: string } = {}): Promise<TrendingResponse | null> {
  const url = new URL(`${apiBase()}/api/v1/broadcasts/trending/`);
  if (params.days) url.searchParams.set("days", String(params.days));
  url.searchParams.set("limit", String(params.limit ?? 30));
  if (params.offset) url.searchParams.set("offset", String(params.offset));
  if (params.contentType) url.searchParams.set("content_type", params.contentType);
  return fetchJson<TrendingResponse>(url.toString());
}

export function trendingItemToContentCard(item: TrendingItem): ContentCard {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content_type: item.content_type,
    thumbnail_url: item.thumbnail_url,
    duration_seconds: item.duration_seconds,
    published_at: item.published_at,
    channel: { id: item.channel.id, handle: item.channel.handle, display_name: item.channel.name, avatar_url: item.channel.avatar_url },
    engagement_counts: { views: item.view_count, shares: 0, comments: item.comment_count, reactions: item.reaction_count },
  };
}

// ── Categories (apps.broadcasts, public, AllowAny) ──────────────────────

export type ChannelCategoryEntry = { id: string; name: string; slug: string; icon_name?: string; description?: string; subcategories?: ChannelCategoryEntry[] };

export async function fetchChannelCategories(): Promise<ChannelCategoryEntry[]> {
  const data = await fetchJson<ChannelCategoryEntry[]>(`${apiBase()}/api/v1/broadcasts/categories/`);
  return data ?? [];
}

export type CategoryBrowseResponse = { count: number; page: number; page_size: number; results: ContentCard[] };

export async function fetchCategoryBrowse(slug: string, params: { page?: number } = {}): Promise<CategoryBrowseResponse | null> {
  const url = new URL(`${apiBase()}/api/v1/broadcasts/categories/${encodeURIComponent(slug)}/browse/`);
  if (params.page) url.searchParams.set("page", String(params.page));
  return fetchJson<CategoryBrowseResponse>(url.toString());
}

// ── Market (apps.commerce, public read via IsAuthenticatedOrReadOnly) ──
// Matches apps/commerce/views.py CommerceDiscoveryView exactly - a curated
// top-N sections payload, not a paginated list. ProductSerializer/
// ShopSerializer/ShopServiceSerializer both use `fields = '__all__'` (60+
// fields each) - these types only declare what KISTube's cards actually
// render; every other backend field still comes through at runtime and is
// reachable via an index-style access if a future page needs it.
export type MarketProduct = {
  id: string;
  name: string;
  price: string;
  sale_price?: string | null;
  currency: string;
  image_url?: string;
  // Bare shop FK id, not a nested object - ProductSerializer/
  // ShopServiceSerializer both use `fields = '__all__'` with no override,
  // so DRF's default ModelSerializer behavior for a FK is just the id.
  // `product.shop.name` (and service.shop.name) rendered blank everywhere
  // before this was corrected.
  shop: string;
  is_featured?: boolean;
  [key: string]: unknown;
};

export type MarketShop = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_verified: boolean;
  rating_avg: number;
  followers_count: number;
  [key: string]: unknown;
};

export type MarketService = {
  id: string;
  name: string;
  description?: string;
  base_cost_micro?: number;
  shop: string;
  [key: string]: unknown;
};

export type CommerceDiscoveryResponse = {
  currency: string;
  trending_products: MarketProduct[];
  popular_shops: MarketShop[];
  sections: {
    featured_products: MarketProduct[];
    trusted_shops: MarketShop[];
    service_spotlight: MarketService[];
  };
};

export async function fetchMarketDiscovery(q?: string): Promise<CommerceDiscoveryResponse | null> {
  const url = new URL(`${apiBase()}/api/v1/commerce/discovery/`);
  if (q) url.searchParams.set("q", q);
  return fetchJson<CommerceDiscoveryResponse>(url.toString());
}

// ── Market detail pages (apps.commerce, public GET) ─────────────────────
// ProductViewSet.retrieve and PublicShopDetailView were both IsAuthenticated
// (or nonexistent) until this pass - flipped/added the same way as the six
// broadcasts player-feature endpoints, verified against real payout-field
// exposure risk first (see PublicShopSerializer's docstring on the backend).

export type MarketProductDetail = MarketProduct & {
  description?: string;
  stock_qty?: number;
  gallery_images?: { id?: string; image_url?: string }[];
  main_image?: string;
  variants?: { id: string; sku?: string; label?: string; price?: string; stock_qty?: number }[];
  requires_shipping?: boolean;
  fulfillment_summary?: { requires_shipping?: boolean; pickup_available?: boolean; delivery_estimate?: string; stock_status?: string };
};

export async function fetchProductDetail(id: string): Promise<MarketProductDetail | null> {
  return fetchJson<MarketProductDetail>(`${apiBase()}/api/v1/commerce/products/${encodeURIComponent(id)}/`);
}

export type PublicShopProfile = {
  shop: MarketShop;
  products: MarketProductDetail[];
  services: MarketService[];
};

export async function fetchShopProfile(id: string): Promise<PublicShopProfile | null> {
  return fetchJson<PublicShopProfile>(`${apiBase()}/api/v1/commerce/public/shops/${encodeURIComponent(id)}/`);
}

// ── Watch-page player features (apps.broadcasts, public GET) ────────────
// All six of these were IsAuthenticated-only until today - flipped to
// AllowAny for GET so anonymous viewers get the same player features as
// signed-in ones (every write path on these views has its own manual
// role/ownership check, unaffected by this).

export type VideoChapter = { id: string; title: string; start_seconds: number; sort_order: number };
export async function fetchChapters(contentId: string): Promise<VideoChapter[]> {
  const data = await fetchJson<{ results: VideoChapter[] }>(`${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/chapters/`);
  return data?.results ?? [];
}

export type VideoSubtitle = { id: string; language: string; label: string; vtt_url: string; is_auto_generated?: boolean };
export async function fetchSubtitles(contentId: string): Promise<VideoSubtitle[]> {
  const data = await fetchJson<{ results: VideoSubtitle[] }>(`${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/subtitles/`);
  return data?.results ?? [];
}

export type EndScreenConfig = { id: string; config: Array<Record<string, unknown>>; is_enabled: boolean };
export async function fetchEndScreen(contentId: string): Promise<EndScreenConfig | null> {
  return fetchJson<EndScreenConfig>(`${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/end-screen/`);
}

export type VideoCard = { id: string; card_type: "video" | "poll" | "link" | "playlist" | "channel"; title: string; start_seconds: number; end_seconds: number | null; target_id: string; url: string };
export async function fetchCards(contentId: string): Promise<VideoCard[]> {
  const data = await fetchJson<{ results: VideoCard[] } | VideoCard[]>(`${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/cards/`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results ?? [];
}

export type VideoTranscript = { id: string; language_code: string; source: string; status: string; text_plain: string; vtt_url: string };
export async function fetchTranscript(contentId: string, lang = "en"): Promise<VideoTranscript | null> {
  return fetchJson<VideoTranscript>(`${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/transcript/?lang=${encodeURIComponent(lang)}`);
}

export type AudioTrack = { id: string; language_code: string; label: string; url: string; is_default: boolean };
export async function fetchAudioTracks(contentId: string): Promise<AudioTrack[]> {
  const data = await fetchJson<AudioTrack[]>(`${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/audio-tracks/`);
  return data ?? [];
}

export type GeoRestriction = { restriction_type: "block" | "allow"; countries: string[] };
export async function fetchGeoRestriction(contentId: string): Promise<GeoRestriction | null> {
  return fetchJson<GeoRestriction>(`${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/geo-restriction/`);
}

export type PremiereInfo = { trailer_url?: string; pre_chat_opens_at?: string; seconds_until_premiere: number; is_live_now: boolean; viewer_count: number };
export async function fetchPremiere(contentId: string): Promise<PremiereInfo | null> {
  return fetchJson<PremiereInfo>(`${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/premiere/`);
}

export type ProductTag = { id: string; product_id: string; product_url: string; product_title: string; thumbnail_url?: string; price_display?: string; timestamp_seconds: number };
export async function fetchProductTags(contentId: string): Promise<ProductTag[]> {
  const data = await fetchJson<ProductTag[]>(`${apiBase()}/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/products/`);
  return data ?? [];
}

// ── Channel homepage extras (apps.broadcasts, public GET) ───────────────

export type MembershipTier = { id: string; title: string; description: string; price_cents: number; currency: string; perks: string[]; is_joined: boolean };
export async function fetchMembershipTiers(channelId: string): Promise<MembershipTier[]> {
  const data = await fetchJson<MembershipTier[]>(`${apiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channelId)}/membership-tiers/`);
  return data ?? [];
}

export type ChannelShelf = { id: string; title: string; shelf_type: string; sort_order: number };
export async function fetchChannelShelves(channelId: string): Promise<ChannelShelf[]> {
  const data = await fetchJson<ChannelShelf[]>(`${apiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channelId)}/shelves/`);
  return data ?? [];
}

export type ShelfItem = { id: string; content: string | null; playlist: string | null; sort_order: number };
export async function fetchShelfItems(shelfId: string): Promise<ShelfItem[]> {
  const data = await fetchJson<ShelfItem[]>(`${apiBase()}/api/v1/broadcasts/shelves/${encodeURIComponent(shelfId)}/items/`);
  return data ?? [];
}

// ── Playlists (apps.broadcasts, public read paths) ──────────────────────

export type PlaylistDetail = {
  id: string;
  title: string;
  description?: string;
  visibility: string;
  item_count: number;
  results: ContentCard[];
  created_at: string;
  updated_at: string;
};

// UserContentPlaylist's visibility field existed but was never read for
// access control until this endpoint was added - only works for
// public/unlisted playlists (private 404s, including to non-owners).
export async function fetchPublicUserPlaylist(playlistId: string): Promise<PlaylistDetail | null> {
  return fetchJson<PlaylistDetail>(`${apiBase()}/api/v1/broadcasts/user-playlists/${encodeURIComponent(playlistId)}/public/`);
}

export type ChannelPlaylistDetail = {
  playlist: { id: string; channel: ChannelSummary; title: string; description?: string; visibility: string; shuffle_enabled: boolean };
  results: ContentCard[];
};

// GET on this endpoint didn't exist at all before - only the playlist
// *list* was public; there was no way to see what was inside one.
export async function fetchChannelPlaylistItems(playlistId: string): Promise<ChannelPlaylistDetail | null> {
  return fetchJson<ChannelPlaylistDetail>(`${apiBase()}/api/v1/broadcasts/playlists/${encodeURIComponent(playlistId)}/items/`);
}

// ── Health (apps.health_ops, public, AllowAny) ──────────────────────────
// HealthDiscoveryView only ever lists institutions with is_public=True -
// see apps/health_ops/models.py HealthInstitution.is_public for why this
// opt-in field exists. HealthInstitutionPublicSerializer's fields exactly:
export type HealthInstitutionSummary = {
  id: string;
  name: string;
  slug: string;
  institution_type: "clinic" | "hospital" | "lab" | "diagnostics" | "pharmacy" | "wellness_center";
  created_at: string;
};

export type HealthDiscoveryResponse = { results: HealthInstitutionSummary[]; next_cursor: string | null };

export async function fetchHealthDiscovery(params: { q?: string; type?: string; limit?: number; offset?: number } = {}): Promise<HealthDiscoveryResponse | null> {
  const url = new URL(`${apiBase()}/api/v1/health-ops/discovery/`);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.type) url.searchParams.set("type", params.type);
  url.searchParams.set("limit", String(params.limit ?? 24));
  if (params.offset) url.searchParams.set("offset", String(params.offset));
  return fetchJson<HealthDiscoveryResponse>(url.toString());
}

// ── Testimonies (apps.testimony, public GET) ────────────────────────────

export type TestimonyEntry = {
  id: string;
  category: string;
  title: string;
  story: string;
  is_available: boolean;
  expires_at: string;
  media_kind?: string;
  resource_url?: string;
  endorsement_count: number;
  created_at: string;
};

export type TestimonyListResponse = { results: TestimonyEntry[]; count?: number; next?: string | null };

export async function fetchTestimonies(params: { category?: string; limit?: number; offset?: number } = {}): Promise<TestimonyListResponse | null> {
  const url = new URL(`${apiBase()}/api/v1/testimonies/`);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.offset) url.searchParams.set("offset", String(params.offset));
  return fetchJson<TestimonyListResponse>(url.toString());
}

// ── Broadcasts sitemap plan (public, AllowAny) — for app/sitemap.ts ────

// apps/broadcasts/views.py PublicSitemapPlanView returns bare kis.app-
// prefixed URL strings (via _public_channel_url/_public_content_url), not
// objects with per-item timestamps - app/sitemap.ts parses the trailing
// path segments (".../channels/{handle}" and ".../channels/{handle}/content/{id}")
// to rebuild this site's own canonical KISTube URLs, since the upstream
// URLs point at the kis.app placeholder domain, not this website.
export type BroadcastSitemapPlan = {
  indexing_enabled: boolean;
  robots: "index,follow" | "noindex,nofollow";
  channels: string[];
  contents: string[];
};

export async function fetchBroadcastSitemapPlan(): Promise<BroadcastSitemapPlan | null> {
  return fetchJson<BroadcastSitemapPlan>(`${apiBase()}/api/v1/broadcasts/public/sitemap-plan/`);
}
