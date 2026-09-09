// Server-side fetch layer for /join/[type]/[token] - resolves a KIS
// shareable deep-link token against Django's public, unauthenticated
// resolver (apps.core.link_resolver.PublicLinkResolveView) before the
// visitor has necessarily logged in or even installed the app. Modeled on
// website-builder-api.ts's own fetchJson pattern (same env var, same
// timeout, null-on-any-failure so callers can go straight to a
// not-found/error UI state without a try/catch at every call site).
const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

function apiBase(): string {
  return (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");
}

export type LinkResolveStatus = "ok" | "invalid" | "expired" | "revoked";

export type LinkResolveResult = {
  status: LinkResolveStatus;
  type?: string;
  name?: string | null;
  description?: string;
  avatar_url?: string | null;
  detail?: string;
};

const SUPPORTED_LINK_TYPES = new Set(["call", "broadcast-call", "group", "community", "partner"]);

export function isSupportedLinkType(linkType: string): boolean {
  return SUPPORTED_LINK_TYPES.has(linkType);
}

/**
 * Never throws. A network failure, timeout, or malformed response all
 * resolve to the same safe { status: "invalid" } shape a caller can render
 * without a special case - matching PART 5 of the deep-links spec
 * ("malformed URL: never crash... unsupported link: show a useful
 * fallback").
 */
export async function resolveDeepLink(linkType: string, token: string): Promise<LinkResolveResult> {
  if (!isSupportedLinkType(linkType) || !token) {
    return { status: "invalid" };
  }
  try {
    const response = await fetch(
      `${apiBase()}/api/v1/links/resolve/${encodeURIComponent(linkType)}/${encodeURIComponent(token)}/`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    const body = (await response.json().catch(() => null)) as LinkResolveResult | null;
    if (!body || typeof body.status !== "string") {
      return { status: "invalid" };
    }
    return body;
  } catch (error) {
    console.error("link-resolver-api: upstream request failed", linkType, error);
    return { status: "invalid" };
  }
}
