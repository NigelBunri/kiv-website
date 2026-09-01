import { fetchChannelContents, type ContentCard } from "@/lib/kistube-api";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { PollVoteWidget } from "@/components/kistube/PollVoteWidget";
import { formatRelativeTime } from "@/lib/kistube-format";

// Server Component - text/rich_text ChannelContent rows ARE community
// posts (same publish pipeline as videos, just content_type="text" or
// "rich_text"; ?type=post on the channel-contents list maps to exactly
// that pair server-side). Poll posts (content_type="poll") render inline
// with the real vote widget.
export async function ChannelCommunityFeed({ channelId, signedIn }: { channelId: string; signedIn: boolean }) {
  const [posts, polls] = await Promise.all([
    fetchChannelContents(channelId, { type: "post", limit: 20 }),
    fetchChannelContents(channelId, { type: "poll", limit: 10 }),
  ]);

  const combined: ContentCard[] = [...(posts?.results ?? []), ...(polls?.results ?? [])]
    .sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""));

  if (combined.length === 0) {
    return <KISTubeEmptyState title="No posts yet" body="This channel hasn't shared any community posts yet." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {combined.map((post) => (
        <div key={post.id} style={{ padding: "1rem", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)" }}>
          <div className="kt-card-meta" style={{ marginBottom: ".4rem" }}>{formatRelativeTime(post.published_at)}</div>
          {post.title && <h3 style={{ margin: "0 0 .3rem", fontSize: "1rem" }}>{post.title}</h3>}
          {typeof post["text_plain_preview"] === "string" && post["text_plain_preview"] && (
            <p style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: ".9rem" }}>{post["text_plain_preview"] as string}</p>
          )}
          {post.content_type === "poll" && <PollVoteWidget contentId={post.id} signedIn={signedIn} />}
        </div>
      ))}
    </div>
  );
}
