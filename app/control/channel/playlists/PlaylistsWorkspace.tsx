"use client";

import { useState } from "react";

type Playlist = { id: string; title: string; description?: string; visibility: string };
type Content = { id: string; title: string };

export default function PlaylistsWorkspace({
  channelId,
  contents,
  initialPlaylists,
}: {
  channelId: string;
  contents: Content[];
  initialPlaylists: Playlist[];
}) {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [creating, setCreating] = useState(false);
  async function createPlaylist(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/channel/${channelId}/playlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, visibility }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create playlist.");
      setPlaylists((prev) => [...prev, data.data]);
      setTitle(""); setDescription(""); setVisibility("public");
      setMessage({ kind: "success", text: "Playlist created." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create playlist." });
    } finally {
      setCreating(false);
    }
  }

  const [selectedContent, setSelectedContent] = useState<Record<string, string>>({});
  const [busyPlaylistId, setBusyPlaylistId] = useState<string | null>(null);

  async function addToPlaylist(playlistId: string) {
    const contentId = selectedContent[playlistId];
    if (!contentId) return;
    setBusyPlaylistId(playlistId);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/playlists/${playlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_id: contentId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to add to playlist.");
      setMessage({ kind: "success", text: "Added to playlist." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to add to playlist." });
    } finally {
      setBusyPlaylistId(null);
    }
  }

  async function removeFromPlaylist(playlistId: string) {
    const contentId = selectedContent[playlistId];
    if (!contentId) return;
    setBusyPlaylistId(playlistId);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/playlists/${playlistId}/items/${contentId}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to remove from playlist.");
      setMessage({ kind: "success", text: "Removed from playlist (if it was present)." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to remove from playlist." });
    } finally {
      setBusyPlaylistId(null);
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>New playlist</h2>
        <form className="control-form" onSubmit={createPlaylist}>
          <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
          <label>Description<textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          <label>
            Visibility
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={creating || !title.trim()}>{creating ? "Creating…" : "Create playlist"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>Playlists</h2>
        {playlists.length === 0 ? (
          <div className="control-empty">No playlists yet.</div>
        ) : (
          <div className="control-list">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="control-list-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <div>
                  <div className="control-list-row-title">{playlist.title}</div>
                  <div className="control-list-row-meta">{playlist.visibility} · {playlist.description}</div>
                </div>
                {contents.length > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <select value={selectedContent[playlist.id] || ""} onChange={(e) => setSelectedContent((prev) => ({ ...prev, [playlist.id]: e.target.value }))}>
                      <option value="">Pick a post…</option>
                      {contents.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <button type="button" className="button" onClick={() => addToPlaylist(playlist.id)} disabled={busyPlaylistId === playlist.id || !selectedContent[playlist.id]}>Add</button>
                    <button type="button" className="button" onClick={() => removeFromPlaylist(playlist.id)} disabled={busyPlaylistId === playlist.id || !selectedContent[playlist.id]}>Remove</button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
        <p className="control-note">Current playlist contents can&rsquo;t be listed yet - add or remove posts by title above; there&rsquo;s no way to see what&rsquo;s already in a playlist from here.</p>
      </section>
    </>
  );
}
