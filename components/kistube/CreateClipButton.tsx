"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Self-contained - the coordinator drops <CreateClipButton contentId={...}
// currentTimeSeconds={...} signedIn={...} /> into the watch page.
// currentTimeSeconds seeds the clip start time from wherever the video
// player currently is, if the caller tracks that; pass 0 if not wired to
// player state yet - still fully functional, just always starts at 0:00.
export function CreateClipButton({ contentId, currentTimeSeconds = 0, signedIn }: { contentId: string; currentTimeSeconds?: number; signedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(Math.max(0, Math.floor(currentTimeSeconds)));
  const [end, setEnd] = useState(Math.max(0, Math.floor(currentTimeSeconds)) + 30);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openPanel() {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube")}`);
      return;
    }
    setOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }
    if (end - start > 300) {
      setError("Clips can be at most 5 minutes long.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/kistube/contents/${contentId}/clip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_seconds: start, end_seconds: end, title: title.trim() }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Couldn't create that clip.");
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="kt-button kt-button--outline" onClick={openPanel}>
        Clip
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button type="button" className="kt-button kt-button--outline" onClick={() => setOpen(false)}>Clip</button>
      <div className="kt-profile-menu is-open" style={{ width: 280, right: 0 }}>
        {done ? (
          <div style={{ padding: ".7rem" }}>
            <p className="kt-card-meta">Clip submitted — it'll appear here once processed.</p>
            <button type="button" className="kt-button kt-button--outline" onClick={() => { setOpen(false); setDone(false); }}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ padding: ".7rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
            <label style={{ fontSize: ".8rem", fontWeight: 700 }}>
              Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                style={{ display: "block", width: "100%", marginTop: 4, border: "1.5px solid var(--line)", borderRadius: "var(--radius-sm)", padding: ".4rem .6rem" }}
              />
            </label>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <label style={{ fontSize: ".8rem", fontWeight: 700, flex: 1 }}>
                Start (s)
                <input
                  type="number" min={0} value={start}
                  onChange={(event) => setStart(Number(event.target.value))}
                  style={{ display: "block", width: "100%", marginTop: 4, border: "1.5px solid var(--line)", borderRadius: "var(--radius-sm)", padding: ".4rem .6rem" }}
                />
              </label>
              <label style={{ fontSize: ".8rem", fontWeight: 700, flex: 1 }}>
                End (s)
                <input
                  type="number" min={0} value={end}
                  onChange={(event) => setEnd(Number(event.target.value))}
                  style={{ display: "block", width: "100%", marginTop: 4, border: "1.5px solid var(--line)", borderRadius: "var(--radius-sm)", padding: ".4rem .6rem" }}
                />
              </label>
            </div>
            {error && <p style={{ color: "var(--danger)", fontSize: ".8rem" }}>{error}</p>}
            <button type="submit" className="kt-button kt-button--primary" disabled={pending}>
              {pending ? "Creating…" : "Create clip"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
