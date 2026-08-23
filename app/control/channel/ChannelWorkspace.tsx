"use client";

import { useState } from "react";

type Channel = {
  id: string;
  handle: string;
  display_name: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  // Server-computed — see apps/broadcasts/serializers.py's
  // _resolve_channel_avatar. The avatar shown anywhere in the app/website
  // always comes from these, never the raw avatar_url above.
  avatar_kind?: "logo" | "photo" | "initials";
  avatar_display_url?: string;
  avatar_initials?: string;
};

type Content = {
  id: string;
  title: string;
  content_type: string;
  status: string;
  text_plain_preview?: string;
  description_preview?: string;
};

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

export default function ChannelWorkspace({ channel: initialChannel, initialContents }: { channel: Channel; initialContents: Content[] }) {
  const [channel, setChannel] = useState(initialChannel);
  const [contents, setContents] = useState(initialContents);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  // ---- Branding ----
  const [saving, setSaving] = useState(false);
  async function saveBranding(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/channel/${channel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: channel.display_name, description: channel.description, banner_url: channel.banner_url }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save changes.");
      setChannel(data.data);
      setMessage({ kind: "success", text: "Channel updated." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save changes." });
    } finally {
      setSaving(false);
    }
  }

  // ---- New post ----
  const [postTitle, setPostTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [creatingPost, setCreatingPost] = useState(false);
  async function createPost(event: React.FormEvent) {
    event.preventDefault();
    setCreatingPost(true);
    setMessage(null);
    try {
      const data = await postJson(`/api/control/channel/${channel.id}/contents`, { title: postTitle, text_plain: postText });
      setContents((prev) => [data, ...prev]);
      setPostTitle(""); setPostText("");
      setMessage({ kind: "success", text: "Draft created — publish it below when ready." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create post." });
    } finally {
      setCreatingPost(false);
    }
  }

  // ---- Publish / unpublish / delete ----
  const [busyId, setBusyId] = useState<string | null>(null);
  async function publish(id: string) {
    setBusyId(id);
    try {
      const data = await postJson(`/api/control/channel/contents/${id}/publish`);
      setContents((prev) => prev.map((c) => (c.id === id ? { ...c, status: data.status || "published" } : c)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to publish." });
    } finally {
      setBusyId(null);
    }
  }
  async function unpublish(id: string) {
    setBusyId(id);
    try {
      const data = await postJson(`/api/control/channel/contents/${id}/unpublish`);
      setContents((prev) => prev.map((c) => (c.id === id ? { ...c, status: data.status || "draft" } : c)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to unpublish." });
    } finally {
      setBusyId(null);
    }
  }
  async function removeContent(id: string) {
    if (!confirm("Delete this post?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/control/channel/contents/${id}`, { method: "DELETE" });
      if (res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        if (!data.success) throw new Error(data.message || "Unable to delete post.");
      }
      setContents((prev) => prev.filter((c) => c.id !== id));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete post." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>Branding</h2>
        <form className="control-form" onSubmit={saveBranding}>
          <label>Display name<input value={channel.display_name} onChange={(e) => setChannel({ ...channel, display_name: e.target.value })} required /></label>
          <label>Description<textarea rows={3} value={channel.description || ""} onChange={(e) => setChannel({ ...channel, description: e.target.value })} /></label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {channel.avatar_kind === "photo" && channel.avatar_display_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={channel.avatar_display_url} alt="Channel avatar" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }} />
            ) : channel.avatar_kind === "logo" && channel.avatar_display_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={channel.avatar_display_url} alt="KIS" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "contain" }} />
            ) : (
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gold, #caa24a)", color: "#111", fontWeight: 800 }}>
                {channel.avatar_initials || "KC"}
              </div>
            )}
            <p className="control-note" style={{ margin: 0 }}>
              Your channel&rsquo;s avatar is automatic — your own profile photo (or initials if you haven&rsquo;t set
              one), an institution&rsquo;s logo for an org-owned channel, or the official KIS mark if this is GO&rsquo;s
              own channel. There&rsquo;s nothing to upload here.
            </p>
          </div>
          <label>Banner URL<input type="url" value={channel.banner_url || ""} onChange={(e) => setChannel({ ...channel, banner_url: e.target.value })} placeholder="https://…" /></label>
          {channel.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={channel.banner_url} alt="Channel banner" style={{ width: "100%", maxWidth: "480px", maxHeight: "160px", objectFit: "cover", borderRadius: "8px" }} />
          ) : null}
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>New post</h2>
        <p>Text posts publish immediately to your channel. Video and live content are still managed from the app for now.</p>
        <form className="control-form" onSubmit={createPost}>
          <label>Title<input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required /></label>
          <label>Text<textarea rows={4} value={postText} onChange={(e) => setPostText(e.target.value)} /></label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={creatingPost || !postTitle.trim()}>{creatingPost ? "Creating…" : "Create draft"}</button>
          </div>
        </form>
      </section>

      <section className="control-section">
        <h2>Posts</h2>
        {contents.length === 0 ? (
          <div className="control-empty">No posts yet.</div>
        ) : (
          <div className="control-list">
            {contents.map((content) => (
              <div key={content.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{content.title}</div>
                  <div className="control-list-row-meta">{content.text_plain_preview || content.description_preview || content.content_type}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className={`control-badge control-badge--${content.status === "published" ? "active" : "pending"}`}>{content.status}</span>
                  {content.status === "published" ? (
                    <button type="button" className="button" onClick={() => unpublish(content.id)} disabled={busyId === content.id}>Unpublish</button>
                  ) : (
                    <button type="button" className="button primary" onClick={() => publish(content.id)} disabled={busyId === content.id}>Publish</button>
                  )}
                  <button type="button" className="button" onClick={() => removeContent(content.id)} disabled={busyId === content.id}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
