"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useControlProfile } from "./ControlContext";

const NAV_ITEMS = [
  { href: "/control", label: "Dashboard" },
  { href: "/control/partner", label: "Partner organization" },
  { href: "/control/channel", label: "Broadcast channel" },
];

const ADMIN_NAV_ITEMS = [
  { href: "/control/admin", label: "Overview" },
  { href: "/control/admin/users", label: "Users" },
  { href: "/control/admin/partners", label: "Partners" },
  { href: "/control/admin/moderation", label: "Moderation" },
];

export default function ControlShell({ children }: { children: React.ReactNode }) {
  const profile = useControlProfile();
  const pathname = usePathname() || "/control";

  return (
    <div className="control-shell">
      <aside className="control-sidebar">
        <div className="control-sidebar-header">
          <p className="eyebrow">Control panel</p>
          <strong>{profile.displayName}</strong>
          <span className="control-tier-badge">{profile.tierName}</span>
        </div>
        <nav className="control-nav" aria-label="Control panel">
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
        </nav>
      </aside>
      <main className="control-content">{children}</main>
    </div>
  );
}
