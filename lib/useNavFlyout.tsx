"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { TabNavItem } from "@/components/ScrollableTabNav";

export type FlyoutNavEntry = {
  key: string;
  href: string;
  label: string;
  active?: boolean;
  description?: string;
  previewImageUrl?: string;
};

/**
 * Shared hover/focus "mega-menu" preview behind a nav row: hovering or
 * focusing a tab that has a description or preview image shows a card
 * below it with an "Explore" link, without losing the tab's own direct
 * click-to-navigate behavior. Originally built once for the storefront's
 * page nav (WebsiteHeader.tsx); factored out here so the main site nav
 * (SiteShell.tsx) gets the identical, already-hardened behavior instead
 * of a second hand-rolled copy.
 *
 * The card is positioned fixed (via JS-measured coordinates), not an
 * absolutely-positioned child of the tab, because the nav row lives
 * inside ScrollableTabNav's horizontally-scrolling track: an
 * overflow-x:auto ancestor forces overflow-y:auto too (per spec, you
 * can't pair "visible" with a scrolling axis on the same box), which
 * would otherwise clip the card before it ever became visible.
 */
export function useNavFlyout(entries: FlyoutNavEntry[]) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  // Fixed positioning means plain CSS :hover can't carry hover state
  // across the visual gap between the tab and the card below it — a
  // mouseleave on the tab would close the card before the pointer
  // finishes crossing that gap. A short cancellable delay covers the
  // transition without leaving the card open indefinitely.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelScheduledClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }
  function open(key: string, el: HTMLElement) {
    cancelScheduledClose();
    const rect = el.getBoundingClientRect();
    setOpenKey(key);
    setPos({ top: rect.bottom, left: rect.left + rect.width / 2 });
  }
  function scheduleClose() {
    cancelScheduledClose();
    closeTimer.current = setTimeout(() => setOpenKey(null), 150);
  }
  function close() {
    cancelScheduledClose();
    setOpenKey(null);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => cancelScheduledClose(), []);

  const openEntry = openKey ? entries.find((entry) => entry.key === openKey) : undefined;

  const navItems: TabNavItem[] = entries.map((entry) => {
    const hasFlyout = Boolean(entry.description || entry.previewImageUrl);
    if (!hasFlyout) {
      return { href: entry.href, label: entry.label, active: entry.active };
    }
    return {
      href: entry.href,
      label: entry.label,
      active: entry.active,
      render: () => (
        <div
          className="nav-flyout-item"
          onMouseEnter={(e) => open(entry.key, e.currentTarget)}
          onMouseLeave={scheduleClose}
          onFocus={(e) => open(entry.key, e.currentTarget)}
          onBlur={close}
        >
          <Link href={entry.href} aria-current={entry.active ? "page" : undefined} onClick={close}>
            {entry.label}
          </Link>
        </div>
      ),
    };
  });

  const flyout =
    openEntry && pos ? (
      <div
        className="nav-flyout-fixed"
        role="menu"
        style={{ top: pos.top, left: pos.left }}
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleClose}
      >
        <Link href={openEntry.href} className="nav-flyout-card" onClick={close}>
          {openEntry.previewImageUrl ? (
            <img src={openEntry.previewImageUrl} alt="" className="nav-flyout-image" />
          ) : (
            <div className="nav-flyout-image nav-flyout-image--placeholder" aria-hidden="true" />
          )}
          <div className="nav-flyout-copy">
            <span className="nav-flyout-title">{openEntry.label}</span>
            {openEntry.description ? <span className="nav-flyout-description">{openEntry.description}</span> : null}
            <span className="nav-flyout-cta">Explore →</span>
          </div>
        </Link>
      </div>
    ) : null;

  return { navItems, flyout };
}
