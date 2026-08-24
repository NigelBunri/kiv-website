import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ChannelCreateForm from "./ChannelCreateForm";
import ChannelWorkspace from "./ChannelWorkspace";
import { fetchMyChannels, pickChannel } from "./resolveChannel";
import { ChannelSwitcher } from "./ChannelSwitcher";

type Channel = {
  id: string;
  handle: string;
  display_name: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  avatar_kind?: "logo" | "photo" | "initials";
  avatar_display_url?: string;
  avatar_initials?: string;
  subscriber_count?: number;
  payout_account_status?: string;
  payout_account_name?: string;
  payout_bank_last4?: string;
};

function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default async function ChannelPage({ searchParams }: { searchParams: Promise<{ channel?: string }> }) {
  const { channel: requestedChannelId } = await searchParams;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const channels = (await fetchMyChannels(headers)) as Channel[];
  const channel = pickChannel(channels, requestedChannelId) as Channel | null;

  if (!channel) {
    return (
      <>
        <div className="control-header">
          <h1>Broadcast channel</h1>
          <p>Create a channel to publish posts and content, the same as Creator Studio in the app.</p>
        </div>
        <ChannelCreateForm />
      </>
    );
  }

  // No status filter - the channel manager (this user) sees both draft and
  // published content by default; Django only restricts to published for
  // non-managers.
  const [contentsRes, detailRes, analyticsRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channel.id)}/contents/`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    }),
    // The list endpoint above uses the public summary serializer (no
    // payout fields, even gated) - payout status only exists on the
    // detail serializer's owner/manager-gated fields.
    fetch(`${kisApiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channel.id)}/`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    }),
    fetch(`${kisApiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channel.id)}/analytics/`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    }),
  ]);
  const contentsData = contentsRes.ok ? await contentsRes.json() : {};
  const contents = Array.isArray(contentsData?.results) ? contentsData.results : [];
  const detail: Channel = detailRes.ok ? await detailRes.json() : channel;
  const analyticsData = analyticsRes.ok ? await analyticsRes.json() : {};
  const analyticsSummary: Record<string, number> = analyticsData?.summary || {};

  return (
    <>
      <ChannelSwitcher channels={channels} activeId={channel.id} basePath="/control/channel" />
      <div className="control-header">
        <h1>{channel.display_name}</h1>
        <p>@{channel.handle} · {channel.subscriber_count || 0} subscribers</p>
      </div>
      {Object.keys(analyticsSummary).length > 0 ? (
        <section className="control-section">
          <h2>Analytics</h2>
          <div className="control-stat-grid">
            <div className="control-stat-card"><span>Views</span><strong>{analyticsSummary.views ?? 0}</strong></div>
            <div className="control-stat-card"><span>Unique viewers</span><strong>{analyticsSummary.unique_viewers ?? 0}</strong></div>
            <div className="control-stat-card"><span>Watch time</span><strong>{formatWatchTime(analyticsSummary.watch_time_seconds ?? 0)}</strong></div>
            <div className="control-stat-card"><span>Published posts</span><strong>{analyticsSummary.published_count ?? 0}</strong></div>
            <div className="control-stat-card"><span>Reactions</span><strong>{analyticsSummary.reactions ?? 0}</strong></div>
            <div className="control-stat-card"><span>Comments</span><strong>{analyticsSummary.comments ?? 0}</strong></div>
            <div className="control-stat-card"><span>Saves</span><strong>{analyticsSummary.saves ?? 0}</strong></div>
            <div className="control-stat-card"><span>Shares</span><strong>{analyticsSummary.shares ?? 0}</strong></div>
          </div>
        </section>
      ) : null}
      <section className="control-section">
        <h2>Manage</h2>
        <div className="control-actions">
          <a href={`/control/channel/revenue?channel=${encodeURIComponent(channel.id)}`} className="button primary">Revenue &amp; payouts</a>
          <a href={`/control/channel/moderation?channel=${encodeURIComponent(channel.id)}`} className="button">Moderation</a>
          <a href={`/control/channel/playlists?channel=${encodeURIComponent(channel.id)}`} className="button">Playlists</a>
        </div>
      </section>
      <ChannelWorkspace channel={{ ...channel, ...detail }} initialContents={contents} />
    </>
  );
}
