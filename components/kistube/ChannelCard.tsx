import Link from "next/link";
import type { ChannelSummary } from "@/lib/kistube-api";
import { formatCount } from "@/lib/kistube-format";
import { SubscribeButton } from "@/components/kistube/SubscribeButton";

export function ChannelCard({ channel, signedIn }: { channel: ChannelSummary; signedIn: boolean }) {
  return (
    <div className="kt-channel-card">
      <Link href={`/kistube/channel/${channel.handle}`} style={{ display: "contents" }}>
        {channel.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={channel.avatar_url} alt="" className="kt-channel-card-avatar" />
        ) : (
          <span className="kt-channel-card-avatar" />
        )}
        <span className="kt-channel-card-name">
          {channel.display_name}
          {channel.is_verified && <span className="kt-verified-badge">✓</span>}
        </span>
        <span className="kt-channel-card-meta">{formatCount(channel.subscriber_count)} subscribers</span>
      </Link>
      <div className="kt-channel-card-subscribe">
        <SubscribeButton channelId={channel.id} initialSubscribed={!!channel.is_subscribed} signedIn={signedIn} />
      </div>
    </div>
  );
}
