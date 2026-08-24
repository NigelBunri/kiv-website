"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDismissableMenu } from "@/lib/useDismissableMenu";
import { useControlProfile } from "./ControlContext";

type NavLink = { href: string; label: string };
type NavSubGroup = { heading: string; items: NavLink[]; note?: string };
type NavGroup = { heading: string; items?: NavLink[]; subGroups?: NavSubGroup[] };

// Top-level, ungrouped links - account-wide, not specific to one of the
// four domain sections below.
const TOP_NAV_ITEMS: NavLink[] = [
  { href: "/control", label: "Dashboard" },
  { href: "/control/partner", label: "Partner organization" },
];

// The four domains from the original nav requirement. Health, Education,
// and Market each have exactly one entry point: their deeper resources
// (staff, services, courses, bookings, assessments, availability, etc.)
// are all scoped to a specific institution/shop id and are reached from
// that entity's own detail page (the "Manage ..." action buttons built
// there), not from this global nav.
//
// Broadcast is structured differently on purpose: it mirrors the RN app's
// own Channel Studio grouping (ChannelStudioScreen.tsx's five
// StudioTabCategory values - content/live/growth/brand/protect), since
// that's the mental model the product already trained users on. "Brand"
// isn't broken out as its own sub-group here because the website's
// branding form and content composer live on the exact same page
// (/control/channel) rather than separate routes the way the RN app's
// tabs are separate. Only 4 of the RN app's 20 studio tabs have a
// website page today (content list+create, playlists, revenue,
// moderation) - the rest (live streaming, audience/traffic/impressions
// analytics, ads, copyright, subtitles/chapters/end-screens/cards,
// shelves, settings) are real backend capabilities with no website UI
// yet. Sub-groups with nothing built show a note instead of a dead link,
// so the gap reads as "not built yet," not "broken."
const DOMAIN_NAV_GROUPS: NavGroup[] = [
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
    subGroups: [
      {
        heading: "Content",
        items: [
          { href: "/control/channel", label: "Create & manage" },
          { href: "/control/channel/playlists", label: "Playlists" },
        ],
      },
      {
        heading: "Live",
        items: [],
        note: "Live streaming isn't on the website yet - use the KIS app.",
      },
      {
        heading: "Growth",
        items: [{ href: "/control/channel/revenue", label: "Revenue & payouts" }],
      },
      {
        heading: "Protect",
        items: [{ href: "/control/channel/moderation", label: "Moderation" }],
      },
    ],
  },
];

const BOTTOM_NAV_ITEMS: NavLink[] = [{ href: "/control/billing", label: "Billing" }];

const ADMIN_NAV_ITEMS: NavLink[] = [
  { href: "/control/admin", label: "Overview" },
  { href: "/control/admin/users", label: "Users" },
  { href: "/control/admin/partners", label: "Partners" },
  { href: "/control/admin/moderation", label: "Moderation" },
  { href: "/control/admin/audit", label: "Audit trail" },
  { href: "/control/admin/security", label: "Suspicious activity" },
  { href: "/control/admin/verification", label: "Verification queue" },
];

function groupLinks(group: NavGroup): NavLink[] {
  return group.items || group.subGroups?.flatMap((sub) => sub.items) || [];
}

// Every href across the whole nav, used to resolve which single item is
// "active" by longest-prefix match. This matters once a group has sibling
// routes sharing a prefix - e.g. /control/channel is a prefix of
// /control/channel/revenue, so a naive independent per-item prefix check
// would light up both "Create & manage" and "Revenue & payouts" at once
// while on the revenue page. Picking the longest matching href resolves
// that.
const ALL_NAV_HREFS = [
  ...TOP_NAV_ITEMS.map((item) => item.href),
  ...DOMAIN_NAV_GROUPS.flatMap((group) => groupLinks(group).map((item) => item.href)),
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

function groupContainsPath(group: NavGroup, pathname: string): boolean {
  return groupLinks(group).some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

function NavLinkItem({ item, pathname }: { item: NavLink; pathname: string }) {
  return (
    <Link href={item.href} className={`control-nav-link${isNavItemActive(item.href, pathname) ? " control-nav-link--active" : ""}`}>
      {item.label}
    </Link>
  );
}

// A collapsible section used both for the four top-level domain groups
// and, inside Broadcast, its Content/Live/Growth/Protect sub-groups. The
// section containing the current page starts (and stays) open; others
// start collapsed and toggle on click, the same "one tap to expand"
// pattern as an FAQ accordion.
function NavAccordionSection({
  heading,
  isOpen,
  onToggle,
  level,
  children,
}: {
  heading: string;
  isOpen: boolean;
  onToggle: () => void;
  level: "domain" | "sub";
  children: React.ReactNode;
}) {
  return (
    <div className={level === "domain" ? "control-nav-group" : "control-nav-subgroup"}>
      <button
        type="button"
        className={level === "domain" ? "control-nav-heading control-nav-heading--toggle" : "control-nav-subheading control-nav-subheading--toggle"}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {heading}
        <span className="control-nav-chevron" aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
      </button>
      {isOpen ? children : null}
    </div>
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

  const computeOpenGroups = (path: string) => {
    const open = new Set<string>();
    for (const group of DOMAIN_NAV_GROUPS) {
      if (group.items ? groupContainsPath(group, path) : group.subGroups?.some((sub) => groupContainsPath({ heading: sub.heading, items: sub.items }, path))) {
        open.add(group.heading);
      }
    }
    return open;
  };
  const computeOpenSubGroups = (path: string) => {
    const open = new Set<string>();
    for (const group of DOMAIN_NAV_GROUPS) {
      for (const sub of group.subGroups || []) {
        if (groupContainsPath({ heading: sub.heading, items: sub.items }, path)) open.add(sub.heading);
      }
    }
    return open;
  };

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => computeOpenGroups(pathname));
  const [openSubGroups, setOpenSubGroups] = useState<Set<string>>(() => computeOpenSubGroups(pathname));

  // Navigating to a page auto-expands whichever group/sub-group now
  // contains it, without collapsing anything the user opened by hand.
  useEffect(() => {
    setOpenGroups((prev) => new Set([...prev, ...computeOpenGroups(pathname)]));
    setOpenSubGroups((prev) => new Set([...prev, ...computeOpenSubGroups(pathname)]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggleGroup(heading: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(heading)) next.delete(heading); else next.add(heading);
      return next;
    });
  }
  function toggleSubGroup(heading: string) {
    setOpenSubGroups((prev) => {
      const next = new Set(prev);
      if (next.has(heading)) next.delete(heading); else next.add(heading);
      return next;
    });
  }

  const navLinks = (
    <>
      {TOP_NAV_ITEMS.map((item) => <NavLinkItem key={item.href} item={item} pathname={pathname} />)}
      {DOMAIN_NAV_GROUPS.map((group) => (
        <NavAccordionSection key={group.heading} heading={group.heading} level="domain" isOpen={openGroups.has(group.heading)} onToggle={() => toggleGroup(group.heading)}>
          {group.items ? (
            group.items.map((item) => <NavLinkItem key={item.href} item={item} pathname={pathname} />)
          ) : (
            group.subGroups?.map((sub) => (
              <NavAccordionSection key={sub.heading} heading={sub.heading} level="sub" isOpen={openSubGroups.has(sub.heading)} onToggle={() => toggleSubGroup(sub.heading)}>
                {sub.items.length > 0 ? (
                  sub.items.map((item) => <NavLinkItem key={item.href} item={item} pathname={pathname} />)
                ) : (
                  <p className="control-nav-note">{sub.note}</p>
                )}
              </NavAccordionSection>
            ))
          )}
        </NavAccordionSection>
      ))}
      {BOTTOM_NAV_ITEMS.map((item) => <NavLinkItem key={item.href} item={item} pathname={pathname} />)}
      {profile.isSuperuser ? (
        <div className="control-nav-group">
          <p className="control-nav-heading">GO admin</p>
          {ADMIN_NAV_ITEMS.map((item) => <NavLinkItem key={item.href} item={item} pathname={pathname} />)}
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
