import type { Metadata } from "next";
import Link from "next/link";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import type { ChannelSummary } from "@/lib/kistube-api";
import { ChannelCard } from "@/components/kistube/ChannelCard";
import { KISTubeAuthGate, KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

// Auth-gated, per-user data - always noindex regardless of the site-wide
// KISTube indexing flag (see kistubeRobots() in lib/kistube-metadata.ts).
export const metadata: Metadata = kistubeMetadata({
  title: "Subscriptions",
  description: "Channels you subscribe to on KISTube.",
  path: "/kistube/subscriptions",
  robots: kistubeRobots(false),
});

// Full paginated list for this page - deliberately NOT calling
// app/api/kistube/subscriptions/route.ts (that would be a self-referential
// HTTP call from a Server Component). Mirrors lib/kistube-viewer.ts's
// getKisTubeSidebarData() direct-Django pattern instead, just with a
// higher limit than the sidebar's 20-item preview.
async function fetchMySubscriptions(): Promise<ChannelSummary[]> {
  const auth = await getValidSession();
  if (!auth) return [];
  const { session } = auth;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/my-subscriptions/?limit=60`, {
      headers: authHeaders(session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error("kistube subscriptions: fetch failed", error);
    return [];
  }
}

export default async function KISTubeSubscriptionsPage() {
  const { viewer } = await getKisTubeSidebarData();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">Subscriptions</h1>
        <KISTubeAuthGate next="/kistube/subscriptions" body="Sign in to see the channels you subscribe to." />
      </div>
    );
  }

  const channels = await fetchMySubscriptions();

  return (
    <div>
      <h1 className="kt-page-heading">Subscriptions</h1>
      <p className="kt-page-subheading">Channels you subscribe to on KISTube.</p>

      {channels.length === 0 ? (
        <>
          <KISTubeEmptyState title="No subscriptions yet" body="Subscribe to channels to see their latest content here." />
          <p style={{ textAlign: "center", marginTop: "-.5rem" }}>
            <Link href="/kistube/channels" className="kt-button kt-button--primary">Browse channels</Link>
          </p>
        </>
      ) : (
        <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} signedIn={viewer.signedIn} />
          ))}
        </div>
      )}
    </div>
  );
}
