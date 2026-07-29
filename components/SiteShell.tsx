"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, site, utilityRoutes } from "@/lib/site";

function isActiveNavLink(pathname: string | null, href: string) {
  return pathname === href || pathname?.startsWith(`${href}/`) === true;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape key and click-outside both close the dropdown — standard
  // expectations for any menu that overlays page content.
  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      // The toggle button itself must be excluded here, not just the nav —
      // mousedown fires (and bubbles to this document listener) BEFORE the
      // button's own onClick. Without this check, clicking the button to
      // close an open menu would: (1) this handler sees the button as
      // "outside the nav" and closes it, then (2) the button's own onClick
      // fires next and toggles the now-closed state back open — so the
      // button appeared to only ever open the menu, never close it.
      if (
        navRef.current && !navRef.current.contains(target) &&
        toggleRef.current && !toggleRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Kingdom Impact Ventures home">
          <span className="brand-mark" aria-hidden="true">KIV</span>
          <span className="brand-text">
            <strong>{site.name}</strong>
            <small>Business and technology venture of KCAN</small>
          </span>
        </Link>
        <button
          type="button"
          ref={toggleRef}
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-toggle-bar" />
          <span className="menu-toggle-bar" />
          <span className="menu-toggle-bar" />
        </button>
        <nav
          id="primary-navigation"
          ref={navRef}
          className={menuOpen ? "primary-nav is-open" : "primary-nav"}
          aria-label="Primary navigation"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActiveNavLink(pathname, item.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions" aria-label="Primary actions">
          <Link className="header-button header-button--gold" href="/products/kis">View KIS <span aria-hidden="true">→</span></Link>
          <Link className="header-button header-button--light" href="/download">Check availability</Link>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div>
          <strong>{site.name}</strong>
          <p>KIV builds business and technology ventures under {site.parentName}. KIS is the first flagship product.</p>
        </div>
        <nav aria-label="Legal and trust links">
          {utilityRoutes.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
      </footer>
    </>
  );
}
