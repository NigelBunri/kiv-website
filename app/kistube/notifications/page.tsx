import type { Metadata } from "next";
import Link from "next/link";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { KISTubeAuthGate, KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { getKisTubeViewer } from "@/lib/kistube-viewer";
import { formatRelativeTime } from "@/lib/kistube-format";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Notifications",
  description: "Your recent notifications on KISTube.",
  path: "/kistube/notifications",
  robots: kistubeRobots(false),
});

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  target_type?: string | null;
  target_id?: string | null;
  is_read: boolean;
  created_at: string;
};

function deepLinkFor(row: NotificationRow): string | null {
  if (row.target_type === "channel_content" && row.target_id) return `/kistube/watch/${row.target_id}`;
  if (row.target_type === "channel_live_stream" && row.target_id) return `/kistube/watch/${row.target_id}`;
  return null;
}

// Direct Django call from this Server Component - same reasoning as
// app/kistube/history/page.tsx, avoids a self-referential hop through our
// own /api/kistube/notifications route (that route exists for the
// client-side NotificationBell instead).
async function fetchNotifications(): Promise<NotificationRow[]> {
  const auth = await getValidSession();
  if (!auth) return [];
  const { session } = auth;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/notifications/?limit=50`, {
      headers: authHeaders(session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error("kistube notifications: fetch failed", error);
    return [];
  }
}

export default async function KISTubeNotificationsPage() {
  const { viewer } = await getKisTubeViewer();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">Notifications</h1>
        <KISTubeAuthGate next="/kistube/notifications" body="Sign in to see your notifications." />
      </div>
    );
  }

  const rows = await fetchNotifications();

  return (
    <div>
      <h1 className="kt-page-heading">Notifications</h1>
      <p className="kt-page-subheading">
        {rows.length > 0 ? "Showing your 50 most recent notifications." : "Notifications from channels you subscribe to and activity on your content."}
      </p>

      {rows.length === 0 ? (
        <KISTubeEmptyState title="No notifications yet" body="New videos from channels you subscribe to, replies to your comments, reactions and live streams will show up here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
          {rows.map((row) => {
            const href = deepLinkFor(row);
            const content = (
              <div
                style={{
                  padding: "1rem", borderRadius: "var(--radius-md)",
                  background: row.is_read ? "var(--surface)" : "var(--gold-soft)",
                  border: "1px solid var(--line-soft)",
                }}
              >
                <div style={{ fontWeight: row.is_read ? 600 : 800, marginBottom: ".2rem" }}>{row.title}</div>
                {row.body && <div className="kt-card-meta" style={{ marginBottom: ".3rem" }}>{row.body}</div>}
                <div className="kt-card-meta" style={{ fontSize: ".78rem" }}>{formatRelativeTime(row.created_at)}</div>
              </div>
            );
            return href ? (
              <Link key={row.id} href={href} style={{ textDecoration: "none", color: "inherit" }}>
                {content}
              </Link>
            ) : (
              <div key={row.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
