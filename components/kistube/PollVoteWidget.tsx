"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PollData = { question: string; options: { index: number; label: string; votes: number }[]; total_votes: number; my_vote: number | null };

export function PollVoteWidget({ contentId, signedIn }: { contentId: string; signedIn: boolean }) {
  const router = useRouter();
  const [poll, setPoll] = useState<PollData | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/kistube/contents/${contentId}/poll`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.options) setPoll(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  async function vote(optionIndex: number) {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube")}`);
      return;
    }
    if (pending || poll?.my_vote !== null) return;
    setPending(true);
    try {
      const res = await fetch(`/api/kistube/contents/${contentId}/poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_index: optionIndex }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.data) setPoll(data.data);
    } finally {
      setPending(false);
    }
  }

  if (!poll) return null;
  const hasVoted = poll.my_vote !== null;

  return (
    <div style={{ marginTop: ".6rem", display: "flex", flexDirection: "column", gap: ".4rem", maxWidth: 360 }}>
      {poll.options.map((option) => {
        const pct = poll.total_votes > 0 ? Math.round((option.votes / poll.total_votes) * 100) : 0;
        const isMine = poll.my_vote === option.index;
        return (
          <button
            key={option.index}
            type="button"
            onClick={() => vote(option.index)}
            disabled={pending || hasVoted}
            style={{
              position: "relative", textAlign: "left", padding: ".5rem .75rem", borderRadius: "var(--radius-sm)",
              border: `1.5px solid ${isMine ? "var(--gold-strong)" : "var(--line)"}`, background: "var(--surface)",
              cursor: hasVoted ? "default" : "pointer", overflow: "hidden", fontSize: ".85rem",
            }}
          >
            {hasVoted && (
              <span
                aria-hidden="true"
                style={{ position: "absolute", inset: 0, width: `${pct}%`, background: "var(--gold-soft)", zIndex: 0 }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between" }}>
              <span>{option.label}{isMine ? " ✓" : ""}</span>
              {hasVoted && <span>{pct}%</span>}
            </span>
          </button>
        );
      })}
      <span className="kt-card-meta">{poll.total_votes} vote{poll.total_votes === 1 ? "" : "s"}</span>
    </div>
  );
}
