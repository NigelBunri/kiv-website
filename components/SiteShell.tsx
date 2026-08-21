"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, products, site, utilityRoutes } from "@/lib/site";
import { UserMenu } from "./UserMenu";

function isActiveNavLink(pathname: string | null, href: string) {
  return pathname === href || pathname?.startsWith(`${href}/`) === true;
}

// Escape key and click-outside both close a dropdown — standard
// expectations for any menu that overlays page content. Shared by both
// the primary nav toggle and the header actions menu below.
function useDismissableMenu(
  isOpen: boolean,
  close: () => void,
  panelRef: React.RefObject<HTMLElement | null>,
  toggleRef: React.RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      // The toggle button itself must be excluded here, not just the panel —
      // mousedown fires (and bubbles to this document listener) BEFORE the
      // button's own onClick. Without this check, clicking the button to
      // close an open menu would: (1) this handler sees the button as
      // "outside the panel" and closes it, then (2) the button's own onClick
      // fires next and toggles the now-closed state back open — so the
      // button appeared to only ever open the menu, never close it.
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        toggleRef.current && !toggleRef.current.contains(target)
      ) {
        close();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen, close, panelRef, toggleRef]);
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useDismissableMenu(menuOpen, () => setMenuOpen(false), navRef, toggleRef);

  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const actionsToggleRef = useRef<HTMLButtonElement>(null);
  useDismissableMenu(actionsOpen, () => setActionsOpen(false), actionsRef, actionsToggleRef);

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
          <button
            type="button"
            ref={actionsToggleRef}
            className="header-button header-button--gold header-actions-toggle"
            aria-expanded={actionsOpen}
            aria-controls="header-actions-menu"
            aria-haspopup="true"
            onClick={() => setActionsOpen((open) => !open)}
          >
            Get Started <span aria-hidden="true">{actionsOpen ? "▲" : "▼"}</span>
          </button>
          <div
            id="header-actions-menu"
            ref={actionsRef}
            className={actionsOpen ? "header-actions-menu is-open" : "header-actions-menu"}
          >
            <Link className="header-button header-button--gold" href="/products/kis" onClick={() => setActionsOpen(false)}>
              View KIS <span aria-hidden="true">→</span>
            </Link>
            <Link className="header-button header-button--light" href="/download" onClick={() => setActionsOpen(false)}>
              Check availability
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div>
          <strong>{site.name}</strong>
          <p>{site.name} (KIV) builds business and technology ventures under {site.parentName}. KIS is the first flagship product.</p>
        </div>
        <div className="footer-nav-groups">
          <div className="footer-nav-group">
            <span className="footer-nav-heading">Company</span>
            <nav aria-label="Company links">
              {nav.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
              <Link href="/support">Support</Link>
              <Link href="/download">Download</Link>
            </nav>
          </div>
          <div className="footer-nav-group">
            <span className="footer-nav-heading">Products</span>
            <nav aria-label="Product links">
              {products.map((product) => (
                <Link key={product.slug} href={`/products/${product.slug}`}>{product.name}</Link>
              ))}
            </nav>
          </div>
          <div className="footer-nav-group">
            <span className="footer-nav-heading">Legal &amp; trust</span>
            <nav aria-label="Legal and trust links">
              {utilityRoutes.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
