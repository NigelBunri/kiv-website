"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDismissableMenu } from "@/lib/useDismissableMenu";
import { useControlProfile } from "./ControlContext";

// Top-level, ungrouped links — account-wide, not specific to one of the
// four domain sections below.
const TOP_NAV_ITEMS = [
  { href: "/control", label: "Dashboard" },
  { href: "/control/partner", label: "Partner organization" },
];

// The four domains from the original nav requirement. Each group's links
// are exactly the pages that exist and are reachable today - Health,
// Education, and Market's deeper resources (staff, services, courses,
// bookings, assessments, availability, etc.) are all scoped to a specific
// institution/shop id and are reached from that entity's own detail page
// (see the "Manage ..." action buttons built there), not from this global
// nav, so each of those three groups has a single entry point: the
// list+create page for that domain's institutions/shops. Broadcast is the
// one domain with a single channel per account (no id to route through),
// so its sub-features route flatly and can live directly in this nav.
const DOMAIN_NAV_GROUPS = [
  {
    heading: "Health",
    items: [{ href: "/control/institutions/health", label: "Institutions" }],
  },
  {
    heading: "Education",
    items: [{ href: "/control/institutions/education", label: "Institutions" }],
  },
  {
    heading: "Market",
    items: [{ href: "/control/shops", label: "Shops" }],
  },
  {
    heading: "Broadcast",
    items: [
      { href: "/control/channel", label: "Overview" },
      { href: "/control/channel/playlists", label: "Playlists" },
      { href: "/control/channel/moderation", label: "Moderation" },
      { href: "/control/channel/revenue", label: "Revenue & payouts" },
    ],
  },
];

const BOTTOM_NAV_ITEMS = [{ href: "/control/billing", label: "Billing" }];

const ADMIN_NAV_ITEMS = [
  { href: "/control/admin", label: "Overview" },
  { href: "/control/admin/users", label: "Users" },
  { href: "/control/admin/partners", label: "Partners" },
  { href: "/control/admin/moderation", label: "Moderation" },
  { href: "/control/admin/audit", label: "Audit trail" },
  { href: "/control/admin/security", label: "Suspicious activity" },
  { href: "/control/admin/verification", label: "Verification queue" },
];

// Every href across the whole nav, used to resolve which single item is
// "active" by longest-prefix match. This matters once a domain group has
// sibling routes sharing a prefix - e.g. /control/channel is a prefix of
// /control/channel/revenue, so a naive independent per-item prefix check
// would light up both "Overview" and "Revenue & payouts" at once while on
// the revenue page. Picking the longest matching href resolves that.
const ALL_NAV_HREFS = [
  ...TOP_NAV_ITEMS.map((item) => item.href),
  ...DOMAIN_NAV_GROUPS.flatMap((group) => group.items.map((item) => item.href)),
  ...BOTTOM_NAV_ITEMS.map((item) => item.href),
  ...ADMIN_NAV_ITEMS.map((item) => item.href),
];

function isNavItemActive(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  if (href === "/control" || href === "/control/admin") return false; // never prefix-match a bare section root
  if (!pathname.startsWith(`${href}/`)) return false;
  return !ALL_NAV_HREFS.some(
    (other) => other !== href && other.length > href.length && (pathname === other || pathname.startsWith(`${other}/`)),
  );
}

export default function ControlShell({ children }: { children: React.ReactNode }) {
  const profile = useControlProfile();
  const pathname = usePathname() || "/control";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useDismissableMenu(sidebarOpen, () => setSidebarOpen(false), sidebarRef, toggleRef);

  // Closing on route change means a nav link tap inside the drawer doesn't
  // leave it open over the newly-loaded page underneath.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [sidebarOpen]);

  const navLinks = (
    <>
      {TOP_NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={`control-nav-link${isNavItemActive(item.href, pathname) ? " control-nav-link--active" : ""}`}>
          {item.label}
        </Link>
      ))}
      {DOMAIN_NAV_GROUPS.map((group) => (
        <div key={group.heading} className="control-nav-group">
          <p className="control-nav-heading">{group.heading}</p>
          {group.items.map((item) => (
            <Link key={item.href} href={item.href} className={`control-nav-link${isNavItemActive(item.href, pathname) ? " control-nav-link--active" : ""}`}>
              {item.label}
            </Link>
          ))}
        </div>
      ))}
      {BOTTOM_NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={`control-nav-link${isNavItemActive(item.href, pathname) ? " control-nav-link--active" : ""}`}>
          {item.label}
        </Link>
      ))}
      {profile.isSuperuser ? (
        <div className="control-nav-group">
          <p className="control-nav-heading">GO admin</p>
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={`control-nav-link${isNavItemActive(item.href, pathname) ? " control-nav-link--active" : ""}`}>
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <div className="control-shell">
      <div className="control-topbar">
        <button
          type="button"
          ref={toggleRef}
          className="control-sidebar-toggle"
          aria-expanded={sidebarOpen}
          aria-controls="control-sidebar-drawer"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <span className="control-sidebar-toggle-bar" />
          <span className="control-sidebar-toggle-bar" />
          <span className="control-sidebar-toggle-bar" />
        </button>
        <strong>{profile.displayName}</strong>
      </div>

      <aside className="control-sidebar control-sidebar--desktop">
        <div className="control-sidebar-header">
          <p className="eyebrow">Control panel</p>
          <strong>{profile.displayName}</strong>
          <span className="control-tier-badge">{profile.tierName}</span>
        </div>
        <nav className="control-nav" aria-label="Control panel">
          {navLinks}
        </nav>
      </aside>

      <div
        className={sidebarOpen ? "control-sidebar-scrim control-sidebar-scrim--open" : "control-sidebar-scrim"}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="control-sidebar-drawer"
        ref={sidebarRef}
        className={sidebarOpen ? "control-sidebar control-sidebar--drawer control-sidebar--open" : "control-sidebar control-sidebar--drawer"}
      >
        <div className="control-sidebar-header">
          <button
            type="button"
            className="control-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
          <p className="eyebrow">Control panel</p>
          <strong>{profile.displayName}</strong>
          <span className="control-tier-badge">{profile.tierName}</span>
        </div>
        <nav className="control-nav" aria-label="Control panel">
          {navLinks}
        </nav>
      </aside>

      <main className="control-content">{children}</main>
    </div>
  );
}
