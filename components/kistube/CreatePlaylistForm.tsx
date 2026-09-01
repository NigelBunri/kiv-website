"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreatePlaylistForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/kistube/user-playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed, visibility }),
      });
      if (res.ok) {
        setTitle("");
        setOpen(false);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="kt-button kt-button--primary" onClick={() => setOpen(true)} style={{ marginBottom: "1.25rem" }}>
        + New playlist
      </button>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: ".5rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}>
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Playlist title"
        autoFocus
        className="kt-search-form"
        style={{ padding: ".55rem 1rem", minWidth: 220 }}
      />
      <select
        value={visibility}
        onChange={(event) => setVisibility(event.target.value)}
        className="kt-search-form"
        style={{ padding: ".55rem .75rem" }}
      >
        <option value="private">Private</option>
        <option value="unlisted">Unlisted</option>
        <option value="public">Public</option>
      </select>
      <button type="submit" className="kt-button kt-button--primary" disabled={pending || !title.trim()}>Create</button>
      <button type="button" className="kt-button kt-button--outline" onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}
