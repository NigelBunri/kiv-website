"use client";

import { useEffect, useState } from "react";
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
      <Link href={homeHref} className="wb-site-brand" onClick={closeNav}>
        {logoUrl ? (
          <img src={logoUrl} alt="" className="wb-site-brand-mark" />
        ) : (
          <span className="wb-site-brand-mark wb-site-brand-mark--letter" aria-hidden="true">{initial}</span>
        )}
        <span className="wb-site-brand-name">{site.name}</span>
      </Link>

      {hasPages && (
        <nav className="wb-site-nav wb-site-nav--desktop" aria-label={`${site.name} pages`}>
          {site.pages.map((p) => {
            const slug = p.is_home ? "home" : p.slug;
            const href = p.is_home ? `/page/${site.slug}` : `/page/${site.slug}/${p.slug}`;
            return (
              <Link key={p.slug} href={href} aria-current={slug === currentSlug ? "page" : undefined}>
                {p.title}
              </Link>
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
