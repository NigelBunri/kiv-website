"use client";

import { useState } from "react";
import Link from "next/link";
import type { WebsiteBuilderSite } from "@/lib/website-builder-api";
import { UserMenu } from "@/components/UserMenu";

// Every website-builder site gets this header — previously WebsitePageView
// only rendered a bare, unstyled page-switcher <nav> and only when a site
// had more than one page, so a single-page site (the common case) showed
// no header at all: no site name, no logo, nothing a visitor would
// recognize as "this is a real website." Site name is always shown; the
// page list collapses into a hamburger menu below the md breakpoint (see
// .wb-site-nav-toggle / .wb-site-nav--open in globals.css) and only
// renders at all once there's more than one page. Sign-in and "Get the
// app" stay visible at every width — a PC visitor can sign in and buy
// directly on-site (see BuyButton.tsx); a phone visitor gets routed to
// the native app instead (see OpenInApp.tsx on individual content cards).
export function WebsiteHeader({ site, currentSlug }: { site: WebsiteBuilderSite; currentSlug: string }) {
  const [navOpen, setNavOpen] = useState(false);
  const logoUrl = typeof site.branding?.logo_url === "string" ? (site.branding.logo_url as string) : "";
  const initial = (site.name || "?").trim().charAt(0).toUpperCase() || "?";
  const homeHref = `/page/${site.slug}`;
  const hasPages = site.pages.length > 1;

  return (
    <header className="wb-site-header">
      <Link href={homeHref} className="wb-site-brand" onClick={() => setNavOpen(false)}>
        {logoUrl ? (
          <img src={logoUrl} alt="" className="wb-site-brand-mark" />
        ) : (
          <span className="wb-site-brand-mark wb-site-brand-mark--letter" aria-hidden="true">{initial}</span>
        )}
        <span className="wb-site-brand-name">{site.name}</span>
      </Link>

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

      {hasPages && (
        <nav className={`wb-site-nav${navOpen ? " wb-site-nav--open" : ""}`} aria-label={`${site.name} pages`}>
          {site.pages.map((p) => {
            const slug = p.is_home ? "home" : p.slug;
            const href = p.is_home ? `/page/${site.slug}` : `/page/${site.slug}/${p.slug}`;
            return (
              <Link
                key={p.slug}
                href={href}
                aria-current={slug === currentSlug ? "page" : undefined}
                onClick={() => setNavOpen(false)}
              >
                {p.title}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="wb-site-header-tools">
        <Link href="/download" className="wb-site-header-download">Get the app</Link>
        <UserMenu />
      </div>
    </header>
  );
}
