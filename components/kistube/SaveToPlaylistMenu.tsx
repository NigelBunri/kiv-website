"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SavedIcon } from "@/components/kistube/icons";

type PlaylistRow = { id: string; title: string; is_system: boolean };

export function SaveToPlaylistMenu({ contentId, signedIn }: { contentId: string; signedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistRow[] | null>(null);
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggleOpen() {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube")}`);
      return;
    }
    const next = !open;
    setOpen(next);
    if (next && playlists === null) {
      const res = await fetch("/api/kistube/user-playlists");
      const payload = await res.json().catch(() => ({}));
      // Route proxies through proxyToDjango, which wraps Django's paginated
      // response as { success, data: { results, count, ... } } - reading
      // `.results` off the top level (payload) instead of payload.data
      // always came back empty, so this menu showed "No playlists yet"
      // even for a user with playlists.
      const data = payload?.data ?? payload;
      const rows = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setPlaylists(rows);
    }
  }

  async function addTo(playlistId: string) {
    setAddedTo((prev) => new Set(prev).add(playlistId));
    try {
      const res = await fetch(`/api/kistube/user-playlists/${playlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_id: contentId }),
      });
      if (!res.ok) {
        setAddedTo((prev) => {
          const next = new Set(prev);
          next.delete(playlistId);
          return next;
        });
      }
    } catch {
      setAddedTo((prev) => {
        const next = new Set(prev);
        next.delete(playlistId);
        return next;
      });
    }
  }

  async function createAndAdd(event: React.FormEvent) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/kistube/user-playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, visibility: "private" }),
      });
      const payload = await res.json().catch(() => ({}));
      // Same proxyToDjango { success, data } wrapping as the GET above -
      // the created playlist row lives under payload.data. Reading
      // payload.id directly meant this always fell through: the playlist
      // WAS created server-side, but never appeared in the list and the
      // current video was never actually added to it.
      const data = payload?.data ?? payload;
      if (res.ok && data?.id) {
        setPlaylists((prev) => [{ id: data.id, title: data.title ?? title, is_system: false }, ...(prev ?? [])]);
        await addTo(data.id);
        setNewTitle("");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ position: "relative" }} ref={wrapRef}>
      <button type="button" className="kt-button kt-button--outline" onClick={toggleOpen}>
        <SavedIcon /> Save
      </button>
      {open && signedIn && (
        <div className="kt-profile-menu is-open" style={{ width: 280, right: 0 }} role="menu">
          <div className="kt-profile-menu-header"><strong>Save to playlist</strong></div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {playlists === null ? (
              <div style={{ padding: ".5rem" }}>
                <div className="kt-skeleton" style={{ height: 32, marginBottom: 6, borderRadius: "var(--radius-sm)" }} />
                <div className="kt-skeleton" style={{ height: 32, borderRadius: "var(--radius-sm)" }} />
              </div>
            ) : playlists.length === 0 ? (
              <div className="kt-nav-empty">No playlists yet — create one below.</div>
            ) : (
              playlists.map((playlist) => {
                const added = addedTo.has(playlist.id);
                return (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => !added && addTo(playlist.id)}
                    role="menuitem"
                    style={{
                      display: "flex", justifyContent: "space-between", width: "100%", textAlign: "left",
                      padding: ".5rem .7rem", border: "none", background: "transparent",
                      borderRadius: "var(--radius-sm)", cursor: added ? "default" : "pointer", fontSize: ".88rem",
                    }}
                  >
                    <span>{playlist.title}</span>
                    {added && <span style={{ color: "var(--gold-strong)", fontWeight: 800 }}>✓</span>}
                  </button>
                );
              })
            )}
          </div>
          <div className="kt-profile-menu-divider" />
          <form onSubmit={createAndAdd} style={{ display: "flex", gap: ".4rem", padding: ".3rem .5rem" }}>
            <input
              type="text"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="+ New playlist"
              style={{ flex: 1, border: "1.5px solid var(--line)", borderRadius: "var(--radius-sm)", padding: ".4rem .6rem", fontSize: ".85rem" }}
            />
            <button type="submit" className="kt-button kt-button--primary" style={{ padding: ".4rem .8rem" }} disabled={creating || !newTitle.trim()}>Add</button>
          </form>
        </div>
      )}
    </div>
  );
}
