import type { Metadata } from "next";
import Link from "next/link";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { KISTubeAuthGate, KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { getKisTubeViewer } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Watch Queue",
  description: "Videos queued up to play next on KISTube.",
  path: "/kistube/queue",
  robots: kistubeRobots(false),
});

type QueueRow = { id: number; content: string; content_title: string; content_thumbnail: string; channel_name: string; position: number };

async function fetchQueue(): Promise<QueueRow[]> {
  const auth = await getValidSession();
  if (!auth) return [];
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/queue/`, {
      headers: authHeaders(auth.session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ([]));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("kistube queue: fetch failed", error);
    return [];
  }
}

export default async function KISTubeQueuePage() {
  const { viewer } = await getKisTubeViewer();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">Watch Queue</h1>
        <KISTubeAuthGate next="/kistube/queue" body="Sign in to see your watch queue." />
      </div>
    );
  }

  const rows = await fetchQueue();

  return (
    <div>
      <h1 className="kt-page-heading">Watch Queue</h1>
      <p className="kt-page-subheading">Videos you&rsquo;ve queued up to watch next, in order.</p>

      {rows.length === 0 ? (
        <KISTubeEmptyState title="Your queue is empty" body="Add videos to your queue from any watch page to build a playlist for later." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/kistube/watch/${row.content}`}
              className="kt-related-card"
              style={{ padding: ".5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--line-soft)" }}
            >
              <div className="kt-related-thumb">
                {row.content_thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.content_thumbnail} alt="" />
                ) : null}
              </div>
              <div>
                <h3 className="kt-card-title">{row.content_title}</h3>
                <div className="kt-card-meta">{row.channel_name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
