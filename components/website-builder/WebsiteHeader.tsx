"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { WebsiteBuilderSite } from "@/lib/website-builder-api";
import { UserMenu } from "@/components/UserMenu";
import { PublicCartIcon } from "./PublicCartIcon";
import { ScrollableTabNav, type TabNavItem } from "@/components/ScrollableTabNav";

// Every website-builder site gets this header — previously WebsitePageView
// only rendered a bare, unstyled page-switcher <nav> and only when a site
// had more than one page, so a single-page site (the common case) showed
// no header at all: no site name, no logo, nothing a visitor would
// recognize as "this is a real website." Site name is always shown; the
// page list collapses into a full-screen slide-in panel below the md
// breakpoint (see .wb-site-nav-toggle / .wb-site-nav--open in
// globals.css) and only renders at all once there's more than one page.
// Sign-in and "Get the app" stay visible at every width — a PC visitor
// can sign in and buy directly on-site (see BuyButton.tsx); a phone
// visitor gets routed to the native app instead (see OpenInApp.tsx on
// individual content cards).
export function WebsiteHeader({ site, currentSlug }: { site: WebsiteBuilderSite; currentSlug: string }) {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [nameExpanded, setNameExpanded] = useState(false);
  const [flyoutSlug, setFlyoutSlug] = useState<string | null>(null);
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const logoUrl = typeof site.branding?.logo_url === "string" ? (site.branding.logo_url as string) : "";
  const initial = (site.name || "?").trim().charAt(0).toUpperCase() || "?";
  const homeHref = `/page/${site.slug}`;
  const hasPages = site.pages.length > 1;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Long institution names get truncated on narrow screens (see
  // .wb-site-brand-name's max-width in globals.css) so they don't crowd
  // out the hamburger toggle — tapping the truncated name reveals the
  // full name in a small popover instead of just cutting it off with no
  // way to read the rest.
  useEffect(() => {
    if (!nameExpanded) return;
    const onOutside = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) setNameExpanded(false);
    };
    document.addEventListener("click", onOutside);
    return () => document.removeEventListener("click", onOutside);
  }, [nameExpanded]);

  // A full-screen mobile panel needs the page itself locked so it can't
  // scroll behind the overlay.
  useEffect(() => {
    if (!navOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [navOpen]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => cancelScheduledClose(), []);

  const closeNav = () => setNavOpen(false);

  // The flyout is a sibling of the nav item (not a DOM descendant, unlike
  // the old version) so it can escape the scroll track's clipping — see
  // the .wb-site-nav-flyout--fixed comment in globals.css. That means
  // plain CSS :hover no longer carries hover state across the visual gap
  // between the link and the card below it, so a mouseleave on the item
  // would close it before the pointer finishes crossing that gap. A short
  // cancellable delay covers that transition without leaving the flyout
  // open indefinitely.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function cancelScheduledClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }
  function openFlyout(slug: string, el: HTMLElement) {
    cancelScheduledClose();
    const rect = el.getBoundingClientRect();
    setFlyoutSlug(slug);
    setFlyoutPos({ top: rect.bottom, left: rect.left + rect.width / 2 });
  }
  function scheduleCloseFlyout() {
    cancelScheduledClose();
    closeTimer.current = setTimeout(() => setFlyoutSlug(null), 150);
  }
  const closeFlyout = () => {
    cancelScheduledClose();
    setFlyoutSlug(null);
  };
  const flyoutPage = flyoutSlug
    ? site.pages.find((p) => (p.is_home ? "home" : p.slug) === flyoutSlug)
    : undefined;

  // Fed to ScrollableTabNav for the desktop row — capped to roughly 5
  // visible tabs with drag/arrow scrolling for the rest (see
  // .scroll-tab-track.wb-site-nav--desktop in globals.css). Pages with a
  // mega-menu flyout use `render` since they need extra markup around the
  // link, not just the link itself.
  const desktopNavItems: TabNavItem[] = site.pages.map((p) => {
    const slug = p.is_home ? "home" : p.slug;
    const href = p.is_home ? `/page/${site.slug}` : `/page/${site.slug}/${p.slug}`;
    const isActive = slug === currentSlug;
    const hasFlyout = Boolean(p.description || p.preview_image_url);
    if (!hasFlyout) {
      return { href, label: p.title, active: isActive };
    }
    return {
      href,
      label: p.title,
      active: isActive,
      render: () => (
        <div
          className="wb-site-nav-item"
          onMouseEnter={(e) => openFlyout(slug, e.currentTarget)}
          onMouseLeave={scheduleCloseFlyout}
          onFocus={(e) => openFlyout(slug, e.currentTarget)}
          onBlur={closeFlyout}
        >
          <Link href={href} aria-current={isActive ? "page" : undefined}>
            {p.title}
          </Link>
        </div>
      ),
    };
  });

  return (
    <header className={`wb-site-header${scrolled ? " wb-site-header--scrolled" : ""}${navOpen ? " wb-site-header--nav-open" : ""}`}>
      <div className="wb-site-brand" ref={brandRef}>
        <Link href={homeHref} className="wb-site-brand-link" onClick={closeNav} aria-label={`${site.name} — home`}>
          {logoUrl ? (
            <img src={logoUrl} alt="" className="wb-site-brand-mark" />
          ) : (
            <span className="wb-site-brand-mark wb-site-brand-mark--letter" aria-hidden="true">{initial}</span>
          )}
        </Link>
        <button
          type="button"
          className="wb-site-brand-name"
          onClick={() => setNameExpanded((prev) => !prev)}
          aria-expanded={nameExpanded}
        >
          {site.name}
        </button>
        {nameExpanded && <div className="wb-site-brand-tooltip" role="tooltip">{site.name}</div>}
      </div>

      {hasPages && (
        <ScrollableTabNav
          items={desktopNavItems}
          ariaLabel={`${site.name} pages`}
          trackClassName="wb-site-nav wb-site-nav--desktop"
        />
      )}

      <div className="wb-site-header-tools">
        {site.owner_type === "shop" ? <PublicCartIcon /> : null}
        <UserMenu />
        <Link href="/download" className="wb-site-header-download">Get the app</Link>
        {hasPages && (
          <button
            type="button"
            className="wb-site-nav-toggle"
            aria-expanded={navOpen}
            aria-label={navOpen ? "Close menu" : "Open menu"}
            onClick={() => setNavOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </div>

      {flyoutPage && flyoutPos && (() => {
        const href = flyoutPage.is_home ? `/page/${site.slug}` : `/page/${site.slug}/${flyoutPage.slug}`;
        return (
          <div
            className="wb-site-nav-flyout--fixed"
            role="menu"
            style={{ top: flyoutPos.top, left: flyoutPos.left }}
            onMouseEnter={cancelScheduledClose}
            onMouseLeave={scheduleCloseFlyout}
          >
            <Link href={href} className="wb-site-nav-flyout-card" onClick={() => { closeNav(); closeFlyout(); }}>
              {flyoutPage.preview_image_url ? (
                <img src={flyoutPage.preview_image_url} alt="" className="wb-site-nav-flyout-image" />
              ) : (
                <div className="wb-site-nav-flyout-image wb-site-nav-flyout-image--placeholder" aria-hidden="true" />
              )}
              <div className="wb-site-nav-flyout-copy">
                <span className="wb-site-nav-flyout-title">{flyoutPage.title}</span>
                {flyoutPage.description ? <span className="wb-site-nav-flyout-description">{flyoutPage.description}</span> : null}
                <span className="wb-site-nav-flyout-cta">Explore →</span>
              </div>
            </Link>
          </div>
        );
      })()}

      {hasPages && (
        <>
          <div className={`wb-site-nav-scrim${navOpen ? " wb-site-nav-scrim--open" : ""}`} onClick={closeNav} aria-hidden="true" />
          <nav
            id="wb-site-nav-mobile"
            className={`wb-site-nav wb-site-nav--mobile${navOpen ? " wb-site-nav--open" : ""}`}
            aria-label={`${site.name} pages`}
          >
            <button type="button" className="wb-site-nav-mobile-close" onClick={closeNav} aria-label="Close menu">
              ✕
            </button>
            {site.pages.map((p, i) => {
              const slug = p.is_home ? "home" : p.slug;
              const href = p.is_home ? `/page/${site.slug}` : `/page/${site.slug}/${p.slug}`;
              return (
                <Link
                  key={p.slug}
                  href={href}
                  aria-current={slug === currentSlug ? "page" : undefined}
                  onClick={closeNav}
                  style={{ transitionDelay: navOpen ? `${60 + i * 45}ms` : "0ms" }}
                >
                  {p.title}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </header>
  );
}
