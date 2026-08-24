import { authHeaders, getValidSession, kisApiBase, type Session } from "@/lib/session";

// Server-only profile fetch for the /control section - reuses the same
// GET /api/v1/profiles/me/ endpoint the mobile app's "am I GO" check
// (PartnersScreen.tsx's checkSuperuser/isGoUser) relies on. Deliberately
// NOT /api/v1/users/me/ - that serializer's Meta.exclude strips
// is_superuser/is_staff entirely (apps/accounts/serializers.py), so it
// can't answer the GO-gating question at all.
export type ControlProfile = {
  userId: string;
  displayName: string;
  isSuperuser: boolean;
  tierName: string;
  tierRank: number;
};

// Business Pro's seeded rank (apps/accounts/tier_presets.py) - the floor
// for control-panel eligibility. Partner (4) and Partner Pro (5) clear it
// automatically since AccountTier.rank is monotonic by design.
export const CONTROL_PANEL_MIN_TIER_RANK = 3;

export async function fetchControlProfile(): Promise<{ profile: ControlProfile; session: Session } | null> {
  const auth = await getValidSession();
  if (!auth) return null;
  const { session } = auth;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/profiles/me/`, {
      headers: authHeaders(session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const profile: ControlProfile = {
      userId: String(data?.user?.id || ""),
      displayName: String(data?.user?.display_name || "there"),
      isSuperuser: Boolean(data?.user?.is_superuser),
      tierName: String(data?.account?.tier?.name || "Free"),
      tierRank: Number(data?.account?.tier?.tier_rank ?? 0),
    };
    return { profile, session };
  } catch (error) {
    console.error("controlAuth: profile fetch failed", error);
    return null;
  }
}

export function isControlPanelEligible(profile: ControlProfile): boolean {
  return profile.isSuperuser || profile.tierRank >= CONTROL_PANEL_MIN_TIER_RANK;
}
