import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ChannelCreateForm from "./ChannelCreateForm";
import ChannelWorkspace from "./ChannelWorkspace";

type Channel = {
  id: string;
  handle: string;
  display_name: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  subscriber_count?: number;
};

export default async function ChannelPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const listRes = await fetch(`${kisApiBase()}/api/v1/broadcasts/channels/?mine=1`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  const listData = listRes.ok ? await listRes.json() : {};
  const channels: Channel[] = Array.isArray(listData?.results) ? listData.results : [];
  const channel = channels[0];

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

  // No status filter — the channel manager (this user) sees both draft and
  // published content by default; Django only restricts to published for
  // non-managers.
  const contentsRes = await fetch(`${kisApiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channel.id)}/contents/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const contentsData = contentsRes.ok ? await contentsRes.json() : {};
  const contents = Array.isArray(contentsData?.results) ? contentsData.results : [];

  return (
    <>
      <div className="control-header">
        <h1>{channel.display_name}</h1>
        <p>@{channel.handle} · {channel.subscriber_count || 0} subscribers</p>
      </div>
      <ChannelWorkspace channel={channel} initialContents={contents} />
    </>
  );
}
