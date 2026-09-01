import { authHeaders, getValidSession, kisApiBase, setSessionCookie, type Session } from "@/lib/session";

// Shared by app/api/kistube/me/route.ts (client-side re-checks, e.g. after
// login redirect) and the /kistube layout Server Component (initial render
// - avoids an extra same-origin fetch round trip on every page load).
export type KisTubeViewer =
  | { signedIn: false }
  | {
      signedIn: true;
      userId: string;
      displayName: string;
      avatarUrl: string | null;
      tierName: string;
      tierRank: number;
    };

export async function getKisTubeViewer(): Promise<{ viewer: KisTubeViewer; refreshedSession: Session | null }> {
  const auth = await getValidSession();
  if (!auth) return { viewer: { signedIn: false }, refreshedSession: null };
  const { session, refreshed } = auth;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/profiles/me/`, {
      headers: authHeaders(session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return { viewer: { signedIn: false }, refreshedSession: refreshed ? session : null };
    const data = await res.json();
    return {
      viewer: {
        signedIn: true,
        userId: String(data?.user?.id || ""),
        displayName: String(data?.user?.display_name || "there"),
        avatarUrl: data?.user?.avatar_url || null,
        tierName: String(data?.account?.tier?.name || "Free"),
        tierRank: Number(data?.account?.tier?.tier_rank ?? 0),
      },
      refreshedSession: refreshed ? session : null,
    };
  } catch (error) {
    console.error("kistube-viewer: profile fetch failed", error);
    return { viewer: { signedIn: false }, refreshedSession: refreshed ? session : null };
  }
}

export type KisTubeFeedStatus = {
  seconds_consumed: number;
  limit_seconds: number;
  seconds_remaining: number;
  limit_reached: boolean;
};

export type KisTubeSubscription = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url?: string;
  is_verified: boolean;
};

export type KisTubeSidebarData = {
  viewer: KisTubeViewer;
  subscriptions: KisTubeSubscription[];
  feedStatus: KisTubeFeedStatus | null;
};

// One consolidated fetch for everything the /kistube layout needs to
// render the topbar + sidebar on first paint, so the shell never flashes
// a signed-out state for a signed-in visitor. Session-refresh cookie
// writes are intentionally dropped here (Server Components can't set
// response headers) - the next Route Handler call (e.g. /api/kistube/me
// on a client-side re-check) re-refreshes and persists it instead.
export async function getKisTubeSidebarData(): Promise<KisTubeSidebarData> {
  const auth = await getValidSession();
  if (!auth) return { viewer: { signedIn: false }, subscriptions: [], feedStatus: null };
  const { session } = auth;
  const headers = authHeaders(session);
  const base = kisApiBase();

  const [profileRes, subsRes, feedRes] = await Promise.allSettled([
    fetch(`${base}/api/v1/profiles/me/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${base}/api/v1/broadcasts/my-subscriptions/?limit=20`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${base}/api/v1/engagement/feed-status/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);

  let viewer: KisTubeViewer = { signedIn: false };
  if (profileRes.status === "fulfilled" && profileRes.value.ok) {
    const data = await profileRes.value.json();
    viewer = {
      signedIn: true,
      userId: String(data?.user?.id || ""),
      displayName: String(data?.user?.display_name || "there"),
      avatarUrl: data?.user?.avatar_url || null,
      tierName: String(data?.account?.tier?.name || "Free"),
      tierRank: Number(data?.account?.tier?.tier_rank ?? 0),
    };
  }

  let subscriptions: KisTubeSubscription[] = [];
  if (subsRes.status === "fulfilled" && subsRes.value.ok) {
    const data = await subsRes.value.json();
    subscriptions = Array.isArray(data?.results) ? data.results : [];
  }

  let feedStatus: KisTubeFeedStatus | null = null;
  if (feedRes.status === "fulfilled" && feedRes.value.ok) {
    feedStatus = await feedRes.value.json();
  }

  return { viewer, subscriptions, feedStatus };
}

export { setSessionCookie };
