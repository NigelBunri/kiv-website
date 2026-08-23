"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDismissableMenu } from "@/lib/useDismissableMenu";
import { useControlProfile } from "./ControlContext";

const NAV_ITEMS = [
  { href: "/control", label: "Dashboard" },
  { href: "/control/partner", label: "Partner organization" },
  { href: "/control/channel", label: "Broadcast channel" },
  { href: "/control/billing", label: "Billing" },
];

const ADMIN_NAV_ITEMS = [
  { href: "/control/admin", label: "Overview" },
  { href: "/control/admin/users", label: "Users" },
  { href: "/control/admin/partners", label: "Partners" },
  { href: "/control/admin/moderation", label: "Moderation" },
  { href: "/control/admin/audit", label: "Audit trail" },
  { href: "/control/admin/security", label: "Suspicious activity" },
  { href: "/control/admin/verification", label: "Verification queue" },
];

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
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`control-nav-link${pathname === item.href ? " control-nav-link--active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
      {profile.isSuperuser ? (
        <>
          <p className="control-nav-heading">GO admin</p>
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`control-nav-link${pathname === item.href || (item.href !== "/control/admin" && pathname.startsWith(item.href)) ? " control-nav-link--active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </>
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
