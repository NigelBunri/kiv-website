"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, products, site, utilityRoutes } from "@/lib/site";
import { useDismissableMenu } from "@/lib/useDismissableMenu";
import { useNavFlyout, type FlyoutNavEntry } from "@/lib/useNavFlyout";
import { UserMenu } from "./UserMenu";
import { ScrollableTabNav } from "./ScrollableTabNav";

function isActiveNavLink(pathname: string | null, href: string) {
  return pathname === href || pathname?.startsWith(`${href}/`) === true;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useDismissableMenu(menuOpen, () => setMenuOpen(false), navRef, toggleRef);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const actionsToggleRef = useRef<HTMLButtonElement>(null);
  useDismissableMenu(actionsOpen, () => setActionsOpen(false), actionsRef, actionsToggleRef);

  const navEntries: FlyoutNavEntry[] = nav.map((item) => ({
    key: item.href,
    href: item.href,
    label: item.label,
    active: isActiveNavLink(pathname, item.href),
    description: item.description,
    previewImageUrl: item.previewImage,
  }));
  const { navItems, flyout } = useNavFlyout(navEntries);

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
          aria-controls="primary-navigation-mobile"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-toggle-bar" />
          <span className="menu-toggle-bar" />
          <span className="menu-toggle-bar" />
        </button>
        <ScrollableTabNav items={navItems} ariaLabel="Primary navigation" trackClassName="primary-nav" />
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

        {flyout}

        {/* Mobile slide-in panel - .header-actions is display:none below the
            collapse breakpoint (see globals.css), so "View KIS" / "Check
            availability" / sign-in would otherwise be unreachable on
            mobile; they're merged into this same panel as the page links
            instead of living in a second, separate mobile menu. */}
        <div
          className={menuOpen ? "primary-nav-scrim primary-nav-scrim--open" : "primary-nav-scrim"}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <nav
          id="primary-navigation-mobile"
          ref={navRef}
          className={menuOpen ? "primary-nav-mobile primary-nav-mobile--open" : "primary-nav-mobile"}
          aria-label="Primary navigation"
        >
          <button
            type="button"
            className="primary-nav-mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
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
          <div className="primary-nav-mobile-divider" role="separator" />
          <Link className="header-button header-button--gold" href="/products/kis" onClick={() => setMenuOpen(false)}>
            View KIS <span aria-hidden="true">→</span>
          </Link>
          <Link className="header-button header-button--light" href="/download" onClick={() => setMenuOpen(false)}>
            Check availability
          </Link>
          <UserMenu />
        </nav>
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
              {/* Not added to the `products` array above - KISTube is a
                  section inside the KIS app, not a separate KIV venture,
                  so it doesn't carry a stage/summary/availability entry
                  the way KIS/KIE/KIM/KIP/KIH do. */}
              <Link href="https://kistube.kingdomimpactventures.org">KISTube</Link>
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
