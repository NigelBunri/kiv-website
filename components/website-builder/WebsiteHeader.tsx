"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { WebsiteBuilderSite } from "@/lib/website-builder-api";
import { UserMenu } from "@/components/UserMenu";

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

  const closeNav = () => setNavOpen(false);

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
        <nav className="wb-site-nav wb-site-nav--desktop" aria-label={`${site.name} pages`}>
          {site.pages.map((p) => {
            const slug = p.is_home ? "home" : p.slug;
            const href = p.is_home ? `/page/${site.slug}` : `/page/${site.slug}/${p.slug}`;
            // Only pages with a real description or preview image get the
            // mega-menu flyout treatment on hover/focus — everything else
            // stays a plain link rather than showing an empty panel. Both
            // fields come from that page's own SEO settings (already
            // owner-editable), not new invented content.
            const hasFlyout = Boolean(p.description || p.preview_image_url);
            if (!hasFlyout) {
              return (
                <Link key={p.slug} href={href} aria-current={slug === currentSlug ? "page" : undefined}>
                  {p.title}
                </Link>
              );
            }
            return (
              <div key={p.slug} className="wb-site-nav-item">
                <Link href={href} aria-current={slug === currentSlug ? "page" : undefined}>
                  {p.title}
                </Link>
                <div className="wb-site-nav-flyout" role="menu">
                  <Link href={href} className="wb-site-nav-flyout-card" onClick={closeNav}>
                    {p.preview_image_url ? (
                      <img src={p.preview_image_url} alt="" className="wb-site-nav-flyout-image" />
                    ) : (
                      <div className="wb-site-nav-flyout-image wb-site-nav-flyout-image--placeholder" aria-hidden="true" />
                    )}
                    <div className="wb-site-nav-flyout-copy">
                      <span className="wb-site-nav-flyout-title">{p.title}</span>
                      {p.description ? <span className="wb-site-nav-flyout-description">{p.description}</span> : null}
                      <span className="wb-site-nav-flyout-cta">Explore →</span>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </nav>
      )}

      <div className="wb-site-header-tools">
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

      {hasPages && (
        <>
          <div className={`wb-site-nav-scrim${navOpen ? " wb-site-nav-scrim--open" : ""}`} onClick={closeNav} aria-hidden="true" />
          <nav
            id="wb-site-nav-mobile"
            className={`wb-site-nav wb-site-nav--mobile${navOpen ? " wb-site-nav--open" : ""}`}
            aria-label={`${site.name} pages`}
          >
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
