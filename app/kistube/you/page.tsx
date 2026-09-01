import type { Metadata } from "next";
import Link from "next/link";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import type { ChannelSummary } from "@/lib/kistube-api";
import { ChannelCard } from "@/components/kistube/ChannelCard";
import { KISTubeAuthGate, KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "You",
  description: "Your KISTube profile — subscriptions, watch time and your channels.",
  path: "/kistube/you",
  robots: kistubeRobots(),
});

function formatMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

type MyChannelsResponse = { results: ChannelSummary[]; next_cursor: string | null };

async function fetchMyChannels(): Promise<MyChannelsResponse | null> {
  const auth = await getValidSession();
  if (!auth) return null;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/channels/?mine=1&limit=10`, {
      headers: authHeaders(auth.session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as MyChannelsResponse;
  } catch (error) {
    console.error("kistube you: my-channels fetch failed", error);
    return null;
  }
}

export default async function KISTubeYouPage() {
  const { viewer, subscriptions, feedStatus } = await getKisTubeSidebarData();

  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">You</h1>
        <p className="kt-page-subheading">Your KISTube profile — subscriptions, watch time and your channels.</p>
        <KISTubeAuthGate next="/kistube/you" body="Sign in to see your KISTube profile, subscriptions and channels." />
      </div>
    );
  }

  const myChannels = await fetchMyChannels();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        {viewer.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={viewer.avatarUrl} alt="" style={{ width: 72, height: 72, borderRadius: 999, objectFit: "cover" }} />
        ) : (
          <div className="kt-avatar" style={{ width: 72, height: 72, fontSize: "1.4rem" }}>
            {viewer.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="kt-page-heading" style={{ margin: 0 }}>{viewer.displayName}</h1>
          <p className="kt-page-subheading" style={{ margin: ".2rem 0 0" }}>{viewer.tierName} tier</p>
        </div>
      </div>

      <div className="kt-filter-row" style={{ marginBottom: "2rem" }}>
        <div style={{ border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", background: "var(--surface)" }}>
          <div className="kt-card-meta">Subscriptions</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{subscriptions.length}</div>
        </div>
        <div style={{ border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", background: "var(--surface)" }}>
          <div className="kt-card-meta">Watch time today</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>
            {feedStatus ? formatMinutes(feedStatus.seconds_consumed) : "—"}
          </div>
        </div>
      </div>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className="kt-related-heading">Your channels</h2>
        {myChannels && myChannels.results.length > 0 ? (
          <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {myChannels.results.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} signedIn={viewer.signedIn} />
            ))}
          </div>
        ) : (
          <KISTubeEmptyState
            title="You don't have a channel yet"
            body="Create a channel to start publishing content to KISTube."
          />
        )}
        {(!myChannels || myChannels.results.length === 0) && (
          <p className="kt-page-subheading" style={{ marginTop: ".75rem" }}>
            <Link href="/control/channel">Create a channel →</Link>
          </p>
        )}
      </section>

      <section>
        <h2 className="kt-related-heading">Quick links</h2>
        <div className="kt-filter-row">
          <Link href="/kistube/subscriptions" className="kt-filter-chip">Subscriptions</Link>
          <Link href="/kistube/saved" className="kt-filter-chip">Saved</Link>
          <Link href="/kistube/history" className="kt-filter-chip">History</Link>
          <Link href="/control" className="kt-filter-chip">Settings</Link>
        </div>
      </section>
    </div>
  );
}
