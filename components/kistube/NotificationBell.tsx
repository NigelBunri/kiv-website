"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon } from "@/components/kistube/icons";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { formatRelativeTime } from "@/lib/kistube-format";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  target_type?: string | null;
  target_id?: string | null;
  is_read: boolean;
  created_at: string;
  context_data?: Record<string, unknown>;
};

function deepLinkFor(row: NotificationRow): string | null {
  if (row.target_type === "channel_content" && row.target_id) return `/kistube/watch/${row.target_id}`;
  if (row.target_type === "channel_live_stream" && row.target_id) return `/kistube/watch/${row.target_id}`;
  return null;
}

function extractRows(data: unknown): NotificationRow[] {
  if (Array.isArray(data)) return data as NotificationRow[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: NotificationRow[] }).results;
  }
  return [];
}

// Self-contained - needs no props beyond signedIn. Polls its own unread
// count independently of whatever shell it's dropped into.
export function NotificationBell({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [rows, setRows] = useState<NotificationRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/kistube/notifications/unread-count");
        if (!res.ok || cancelled) return;
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setUnreadCount(Number(data?.unread_count ?? 0));
      } catch {
        // network hiccup - next poll tick will retry
      }
    }
    poll();
    const interval = setInterval(poll, 45_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [signedIn]);

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
    if (next && rows === null) {
      setLoading(true);
      try {
        const res = await fetch("/api/kistube/notifications?limit=8");
        const data = await res.json().catch(() => ({}));
        setRows(extractRows(data));
      } finally {
        setLoading(false);
      }
    }
  }

  async function markRead(id: string) {
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, is_read: true } : r)) : prev));
    setUnreadCount((c) => Math.max(0, c - 1));
    fetch(`/api/kistube/notifications/${id}/mark-read`, { method: "POST" }).catch(() => {});
  }

  async function markAllRead() {
    setRows((prev) => (prev ? prev.map((r) => ({ ...r, is_read: true })) : prev));
    setUnreadCount(0);
    fetch("/api/kistube/notifications/mark-all-read", { method: "POST" }).catch(() => {});
  }

  function onRowClick(row: NotificationRow) {
    if (!row.is_read) markRead(row.id);
    const href = deepLinkFor(row);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  }

  return (
    <div className="kt-profile-menu-wrap" ref={wrapRef} style={{ position: "relative" }}>
      <button type="button" className="kt-icon-button" aria-label="Notifications" onClick={toggleOpen} style={{ position: "relative" }}>
        <BellIcon />
        {signedIn && unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, padding: "0 3px",
              borderRadius: 999, background: "var(--danger)", color: "#fff", fontSize: ".62rem",
              fontWeight: 800, display: "grid", placeItems: "center", lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {signedIn && (
        <div className={`kt-profile-menu${open ? " is-open" : ""}`} style={{ width: 340, right: 0 }} role="menu">
          <div className="kt-profile-menu-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <strong>Notifications</strong>
            {rows && rows.some((r) => !r.is_read) && (
              <button
                type="button"
                onClick={markAllRead}
                style={{ background: "none", border: "none", color: "var(--gold-strong)", fontSize: ".8rem", fontWeight: 700, cursor: "pointer", padding: 0 }}
              >
                Mark all read
              </button>
            )}
          </div>
          {loading ? (
            <div style={{ padding: ".5rem" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="kt-skeleton" style={{ height: 48, marginBottom: 8, borderRadius: "var(--radius-sm)" }} />
              ))}
            </div>
          ) : !rows || rows.length === 0 ? (
            <KISTubeEmptyState title="No notifications yet" body="New videos from channels you subscribe to and activity on your content will show up here." />
          ) : (
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {rows.map((row) => {
                const href = deepLinkFor(row);
                const body = (
                  <div style={{ display: "flex", gap: ".1rem", flexDirection: "column" }}>
                    <span style={{ fontWeight: row.is_read ? 500 : 700, fontSize: ".88rem" }}>{row.title}</span>
                    {row.body && <span className="kt-card-meta" style={{ fontSize: ".8rem" }}>{row.body}</span>}
                    <span className="kt-card-meta" style={{ fontSize: ".72rem" }}>{formatRelativeTime(row.created_at)}</span>
                  </div>
                );
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => onRowClick(row)}
                    role="menuitem"
                    style={{
                      display: "block", width: "100%", textAlign: "left", padding: ".6rem .7rem",
                      border: "none", background: row.is_read ? "transparent" : "var(--gold-soft)",
                      borderRadius: "var(--radius-sm)", cursor: href ? "pointer" : "default", marginBottom: 2,
                    }}
                  >
                    {body}
                  </button>
                );
              })}
            </div>
          )}
          <div className="kt-profile-menu-divider" />
          <Link href="/kistube/notifications" role="menuitem" onClick={() => setOpen(false)}>
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
