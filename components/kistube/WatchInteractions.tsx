"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommentEntry } from "@/lib/kistube-api";
import { ThumbUpIcon, SavedIcon, ShareIcon } from "@/components/kistube/icons";
import { formatRelativeTime } from "@/lib/kistube-format";

// Fires the anonymous-safe view-credit POST once per mount, a beat after
// the player is on screen - not on every re-render, and not blocking
// paint. Renders nothing.
export function ViewRecorder({ contentId }: { contentId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const timer = setTimeout(() => {
      fetch(`/api/kistube/contents/${contentId}/view`, { method: "POST" }).catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, [contentId]);
  return null;
}

function requireSignIn(router: ReturnType<typeof useRouter>) {
  router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube")}`);
}

// The public content landing payload (apps/broadcasts/views.py
// _public_content_payload) deliberately omits engagement_counts - unlike
// search results (ContentCard), which do carry it - so this shows a plain
// Like/Liked toggle rather than a count that would otherwise start wrong
// (always 0) and jump on first click regardless of the content's real
// total.
export function ReactionButton({ contentId, signedIn }: { contentId: string; signedIn: boolean }) {
  const router = useRouter();
  const [reacted, setReacted] = useState(false);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!signedIn) return requireSignIn(router);
    if (pending) return;
    setPending(true);
    const next = !reacted;
    setReacted(next);
    try {
      const res = await fetch(`/api/kistube/contents/${contentId}/react`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) setReacted(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" className="kt-button kt-button--outline" onClick={toggle} disabled={pending}>
      <ThumbUpIcon /> {reacted ? "Liked" : "Like"}
    </button>
  );
}

export function SaveButton({ contentId, signedIn }: { contentId: string; signedIn: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!signedIn) return requireSignIn(router);
    if (pending) return;
    setPending(true);
    const next = !saved;
    setSaved(next);
    try {
      const res = next
        ? await fetch("/api/kistube/watch-later/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content_id: contentId }),
          })
        : await fetch(`/api/kistube/watch-later/items?content_id=${encodeURIComponent(contentId)}`, { method: "DELETE" });
      if (!res.ok) setSaved(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" className="kt-button kt-button--outline" onClick={toggle} disabled={pending}>
      <SavedIcon /> {saved ? "Saved" : "Save"}
    </button>
  );
}

export function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url, title: "KISTube" });
        return;
      } catch {
        // user cancelled or share failed - fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable - nothing more we can do without a dialog
    }
  }
  return (
    <button type="button" className="kt-button kt-button--outline" onClick={share}>
      <ShareIcon /> {copied ? "Copied!" : "Share"}
    </button>
  );
}

export function CommentsSection({
  contentId,
  initialComments,
  signedIn,
}: {
  contentId: string;
  initialComments: CommentEntry[];
  signedIn: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!signedIn) return requireSignIn(router);
    const body = draft.trim();
    if (!body || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/kistube/contents/${contentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        // This route goes through proxyToDjango, which wraps the upstream
        // Django response as { success, data } - the raw comment object
        // (what Django's ChannelContentCommentsView.post actually returns)
        // lives under `.data`, not at the top level. Reading `data` itself
        // as the comment silently posted a { user_display: undefined,
        // body: undefined, ... } row into the list: the comment WAS
        // created server-side, but rendered as a blank line, which reads
        // as "nothing happened" when you send one.
        const payload = await res.json();
        const comment = payload?.data ?? payload;
        setComments((prev) => [comment, ...prev]);
        setDraft("");
      }
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <h2 className="kt-related-heading">{comments.length} comments</h2>
      <form onSubmit={submit} style={{ display: "flex", gap: ".5rem", marginBottom: "1.25rem" }}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={signedIn ? "Add a comment" : "Sign in to comment"}
          className="kt-search-form"
          style={{ flex: 1, padding: ".6rem 1rem" }}
        />
        <button type="submit" className="kt-button kt-button--primary" disabled={posting}>Post</button>
      </form>
      {comments.length === 0 ? (
        <p className="kt-page-subheading">No comments yet — be the first to share your thoughts.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {comments.map((comment) => (
            <li key={comment.id}>
              <div className="kt-card-meta"><strong style={{ color: "var(--ink)" }}>{comment.user_display}</strong> · {formatRelativeTime(comment.created_at)}</div>
              <div>{comment.body}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
