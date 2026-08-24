import type { ChannelSummary } from "./resolveChannel";

// Only renders when there's an actual choice to make - a single-channel
// account (the common case) sees nothing extra.
export function ChannelSwitcher({ channels, activeId, basePath }: { channels: ChannelSummary[]; activeId: string; basePath: string }) {
  if (channels.length <= 1) return null;
  return (
    <div className="control-channel-switcher">
      {channels.map((channel) => (
        <a
          key={channel.id}
          href={`${basePath}?channel=${encodeURIComponent(channel.id)}`}
          className={`control-channel-pill${channel.id === activeId ? " control-channel-pill--active" : ""}`}
        >
          {channel.display_name || `@${channel.handle}`}
        </a>
      ))}
    </div>
  );
}
