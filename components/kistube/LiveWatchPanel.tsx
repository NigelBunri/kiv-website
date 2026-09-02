"use client";

import { useEffect, useRef, useState } from "react";
import { formatRelativeTime } from "@/lib/kistube-format";

type LiveStreamRow = {
  id: string;
  content_id: string;
  title: string;
  status: "scheduled" | "live" | "ended" | "cancelled" | "failed";
  scheduled_start_at: string | null;
  started_at: string | null;
  playback_url: string;
  viewer_count: number;
};

type ChatMessage = { id: string; display_name: string; avatar_url: string; message: string; created_at: string; user_id: string | null };

// Self-contained - the coordinator drops
// <LiveWatchPanel contentId={...} channelId={...} signedIn={...} /> into
// the watch page, only when content.content_type === "live_stream".
// Resolves its own ChannelLiveStream row from the channel's live-streams
// list (no direct by-content_id lookup exists upstream), then renders a
// state appropriate to scheduled/live/ended. Renders nothing if no
// matching stream row is found (defensive - the caller's content_type
// check should already guarantee one exists).
export function LiveWatchPanel({ contentId, channelId, signedIn }: { contentId: string; channelId: string; signedIn: boolean }) {
  const [stream, setStream] = useState<LiveStreamRow | null>(null);
  const [resolved, setResolved] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Resolve the stream row once, then poll its detail endpoint directly.
  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      try {
        const res = await fetch(`/api/kistube/channels/${channelId}/live-streams`);
        const payload = await res.json().catch(() => ({}));
        // This route proxies through proxyToDjango, which wraps Django's
        // { results: [...] } as { success, data: { results } } - reading
        // `.results` off the top level always came back empty, so the
        // live panel could never resolve a stream and just rendered
        // nothing for every live video watched through KISTube.
        const data = payload?.data ?? payload;
        const rows: LiveStreamRow[] = Array.isArray(data?.results) ? data.results : [];
        const match = rows.find((row) => row.content_id === contentId) || null;
        if (!cancelled) {
          setStream(match);
          setResolved(true);
        }
      } catch {
        if (!cancelled) setResolved(true);
      }
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [channelId, contentId]);

  useEffect(() => {
    if (!stream) return;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/kistube/live-streams/${stream!.id}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled && data?.id) setStream(data);
      } catch {
        // next tick retries
      }
    }
    const interval = setInterval(poll, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [stream?.id]);

  // Viewer-ping heartbeat while live.
  useEffect(() => {
    if (!stream || stream.status !== "live") return;
    let cancelled = false;
    function ping() {
      fetch(`/api/kistube/live-streams/${stream!.id}/viewer-ping`, { method: "POST" }).catch(() => {});
    }
    ping();
    const interval = setInterval(() => {
      if (!cancelled) ping();
    }, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [stream?.id, stream?.status]);

  // Chat polling.
  useEffect(() => {
    if (!stream || (stream.status !== "live" && stream.status !== "scheduled")) return;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/kistube/live-streams/${stream!.id}/chat?limit=100`);
        if (!res.ok || cancelled) return;
        const data = await res.json().catch(() => ({}));
        if (!cancelled && Array.isArray(data?.results)) setMessages(data.results);
      } catch {
        // next tick retries
      }
    }
    poll();
    const interval = setInterval(poll, 4_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [stream?.id, stream?.status]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !stream || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/kistube/live-streams/${stream.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) setDraft("");
    } finally {
      setSending(false);
    }
  }

  if (!resolved || !stream || stream.status === "ended" || stream.status === "cancelled" || stream.status === "failed") return null;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {stream.status === "scheduled" ? (
        <div className="kt-authgate" style={{ borderStyle: "solid", borderColor: "var(--danger)" }}>
          <p style={{ marginBottom: ".25rem", fontWeight: 700 }}>
            {stream.scheduled_start_at ? `Starting ${formatRelativeTime(stream.scheduled_start_at).replace("ago", "")}`.trim() : "Scheduled to go live soon"}
          </p>
          <p>This premiere hasn&rsquo;t started yet — chat below while you wait.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".75rem" }}>
            <span className="kt-card-live-badge" style={{ position: "static" }}>Live</span>
            <span className="kt-card-meta">{stream.viewer_count} watching</span>
          </div>
          {!playbackFailed && stream.playback_url ? (
            <div className="kt-player-wrap">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={stream.playback_url} controls autoPlay playsInline onError={() => setPlaybackFailed(true)} />
            </div>
          ) : (
            <div className="kt-player-wrap" style={{ display: "grid", placeItems: "center", color: "#fff", textAlign: "center", padding: "1rem" }}>
              <div>
                <p style={{ fontWeight: 700, marginBottom: ".25rem" }}>Live playback isn&rsquo;t available yet</p>
                <p className="kt-card-meta" style={{ color: "rgba(255,255,255,.7)" }}>The broadcaster is live — video playback for this stream is still being configured.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "1rem", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <div style={{ padding: ".6rem .9rem", borderBottom: "1px solid var(--line-soft)", fontWeight: 700, fontSize: ".88rem" }}>Live chat</div>
        <div style={{ maxHeight: 240, overflowY: "auto", padding: ".5rem .9rem", display: "flex", flexDirection: "column", gap: ".4rem" }}>
          {messages.length === 0 ? (
            <p className="kt-card-meta">No messages yet — say hello.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={{ fontSize: ".85rem" }}>
                <strong>{msg.display_name || "Anonymous"}</strong>{" "}
                <span>{msg.message}</span>
              </div>
            ))
          )}
          <div ref={chatBottomRef} />
        </div>
        <form onSubmit={sendMessage} style={{ display: "flex", gap: ".4rem", padding: ".5rem .9rem", borderTop: "1px solid var(--line-soft)" }}>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={signedIn ? "Say something…" : "Chat as a guest…"}
            maxLength={1000}
            style={{ flex: 1, border: "1.5px solid var(--line)", borderRadius: "var(--radius-full)", padding: ".45rem .9rem", fontSize: ".85rem" }}
          />
          <button type="submit" className="kt-button kt-button--primary" disabled={sending || !draft.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
}
