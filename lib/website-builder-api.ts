// Live server-side fetch layer for the KIS Website Builder's public pages
// (kingdomimpactventures.org/page/<slug>[/<page-slug>]). Modeled directly
// on app/api/payment-status/route.ts's proven pattern — same env var,
// same fallback domain, same no-store/timeout config — but called
// directly from Server Components rather than through an intermediate
// /api/* proxy route, since these are plain unauthenticated GETs with no
// CORS concern (server-to-server, not browser-initiated).
//
// Every export returns `null` on any failure (network error, non-2xx,
// malformed JSON) rather than throwing, so callers can go straight to
// Next's notFound() without a try/catch at every call site.
const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

function apiBase(): string {
  return (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      // Website builder content changes without a rebuild — never serve
      // a stale cached response.
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error("website-builder-api: upstream request failed", url, error);
    return null;
  }
}

export type WebsiteBuilderSeo = {
  title: string;
  description: string;
  canonical_url?: string;
  share_image_url?: string;
};

export type WebsiteBuilderKisContentItem = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price_display: string;
  deep_link: string;
  /** product only — which shop to check out against. */
  shop_id?: string;
  /** course only — the underlying EducationInstitutionBroadcast to enroll
   * in; null when this course has no purchasable content yet. */
  checkout_content_id?: string | null;
  [key: string]: unknown;
};

export type WebsiteBuilderResolvedKisVideo = {
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number | null;
};

export type WebsiteBuilderSection = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  resolved_items?: WebsiteBuilderKisContentItem[];
  has_more?: boolean;
  resolved_video?: WebsiteBuilderResolvedKisVideo | null;
  responsive?: { hidden_on?: Array<"mobile" | "desktop"> };
  /** Which of the section type's alternate visual designs to render —
   * see SECTION_VARIANTS in SectionRenderer.tsx. Absent/unrecognized
   * falls back to "classic" (the original single design each type had
   * before variants existed), so old sections keep rendering unchanged. */
  variant?: string;
};

export type WebsiteBuilderSite = {
  slug: string;
  name: string;
  owner_type: string;
  branding: Record<string, unknown>;
  seo: WebsiteBuilderSeo;
  canonical_url: string;
  pages: { slug: string; title: string; is_home: boolean }[];
  updated_at: string | null;
};

export type WebsiteBuilderPage = {
  id: string;
  slug: string;
  title: string;
  is_home: boolean;
  sections: WebsiteBuilderSection[];
  seo: WebsiteBuilderSeo;
  updated_at: string | null;
};

export type WebsiteBuilderKisContentDetail = WebsiteBuilderKisContentItem & {
  gallery?: string[];
  compare_at_price_display?: string;
  in_stock?: boolean;
  categories?: string[];
  duration_minutes?: number;
  seat_limit?: number | null;
  institution_name?: string;
  service_type?: string;
  negotiable?: boolean;
  quote_required?: boolean;
};

export type WebsiteBuilderSitemapPlan = {
  indexing_enabled: boolean;
  robots: string;
  sites: { slug: string; updated_at: string | null; pages: { slug: string; updated_at: string | null }[] }[];
};

function withPreviewToken(url: URL, previewToken?: string) {
  if (previewToken) url.searchParams.set("preview_token", previewToken);
  return url;
}

export async function fetchWebsiteSite(siteSlug: string, previewToken?: string): Promise<WebsiteBuilderSite | null> {
  const url = withPreviewToken(new URL(`${apiBase()}/api/v1/websites/public/sites/${encodeURIComponent(siteSlug)}/`), previewToken);
  return fetchJson<WebsiteBuilderSite>(url.toString());
}

export async function fetchWebsitePage(siteSlug: string, pageSlug: string, previewToken?: string): Promise<WebsiteBuilderPage | null> {
  const url = withPreviewToken(
    new URL(`${apiBase()}/api/v1/websites/public/sites/${encodeURIComponent(siteSlug)}/pages/${encodeURIComponent(pageSlug)}/`),
    previewToken,
  );
  return fetchJson<WebsiteBuilderPage>(url.toString());
}

export async function fetchWebsiteSitemapPlan(): Promise<WebsiteBuilderSitemapPlan | null> {
  return fetchJson<WebsiteBuilderSitemapPlan>(`${apiBase()}/api/v1/websites/public/sitemap-plan/`);
}

export async function fetchWebsiteKisContentDetail(
  siteSlug: string, targetType: string, itemId: string,
): Promise<{ item: WebsiteBuilderKisContentDetail; site: { slug: string; name: string } } | null> {
  const url = `${apiBase()}/api/v1/websites/public/sites/${encodeURIComponent(siteSlug)}/kis-content/${encodeURIComponent(targetType)}/${encodeURIComponent(itemId)}/`;
  return fetchJson<{ item: WebsiteBuilderKisContentDetail; site: { slug: string; name: string } }>(url);
}
