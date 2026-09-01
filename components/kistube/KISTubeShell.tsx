"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { KisTubeFeedStatus, KisTubeSubscription, KisTubeViewer } from "@/lib/kistube-viewer";
import {
  ChannelsIcon,
  EducationIcon,
  FeedsIcon,
  HealthIcon,
  HistoryIcon,
  HomeIcon,
  JobsIcon,
  LogOutIcon,
  MarketIcon,
  MenuIcon,
  SavedIcon,
  SearchIcon,
  SettingsIcon,
  TestimoniesIcon,
  UserIcon,
} from "@/components/kistube/icons";

const SECTION_LINKS = [
  { href: "/kistube/education", label: "Education", Icon: EducationIcon },
  { href: "/kistube/health", label: "Health", Icon: HealthIcon },
  { href: "/kistube/market", label: "Market", Icon: MarketIcon },
  { href: "/kistube/jobs", label: "Jobs", Icon: JobsIcon },
  { href: "/kistube/feeds", label: "Feeds", Icon: FeedsIcon },
  { href: "/kistube/testimonies", label: "Testimonies", Icon: TestimoniesIcon },
  { href: "/kistube/channels", label: "Channels", Icon: ChannelsIcon },
] as const;

const LIBRARY_LINKS = [
  { href: "/kistube/subscriptions", label: "Subscriptions", Icon: ChannelsIcon },
  { href: "/kistube/you", label: "You", Icon: UserIcon },
  { href: "/kistube/saved", label: "Saved", Icon: SavedIcon },
  { href: "/kistube/history", label: "History", Icon: HistoryIcon },
] as const;

function formatMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function NavLink({ href, label, Icon, active }: { href: string; label: string; Icon: React.ComponentType<{ className?: string }>; active: boolean }) {
  return (
    <Link href={href} className={`kt-nav-link${active ? " is-active" : ""}`}>
      <span className="kt-nav-icon"><Icon /></span>
      <span className="kt-nav-label">{label}</span>
    </Link>
  );
}

function SidebarContents({ pathname, subscriptions, feedStatus, viewer }: {
  pathname: string;
  subscriptions: KisTubeSubscription[];
  feedStatus: KisTubeFeedStatus | null;
  viewer: KisTubeViewer;
}) {
  return (
    <>
      <div className="kt-nav-group">
        <NavLink href="/kistube" label="Home" Icon={HomeIcon} active={pathname === "/kistube"} />
      </div>

      <div className="kt-nav-group">
        <div className="kt-nav-heading">Explore</div>
        {SECTION_LINKS.map((link) => (
          <NavLink key={link.href} {...link} active={pathname.startsWith(link.href)} />
        ))}
      </div>

      <div className="kt-nav-group">
        <div className="kt-nav-heading">Library</div>
        {LIBRARY_LINKS.map((link) => (
          <NavLink key={link.href} {...link} active={pathname.startsWith(link.href)} />
        ))}
      </div>

      {viewer.signedIn && (
        <div className="kt-nav-group">
          <div className="kt-nav-heading">Subscriptions</div>
          {subscriptions.length === 0 ? (
            <div className="kt-nav-empty">
              Channels you subscribe to show up here. <Link href="/kistube/channels">Browse channels</Link>
            </div>
          ) : (
            <div className="kt-subscriptions-list">
              {subscriptions.map((sub) => (
                <Link key={sub.id} href={`/kistube/channel/${sub.handle}`} className="kt-subscription-row">
                  {sub.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sub.avatar_url} alt="" className="kt-subscription-avatar" />
                  ) : (
                    <span className="kt-subscription-avatar" />
                  )}
                  <span className="kt-subscription-name">{sub.display_name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {viewer.signedIn && feedStatus && (
        <div className="kt-watchtime">
          <div className="kt-watchtime-heading">Today&rsquo;s watch time</div>
          <div className="kt-watchtime-row">
            <span>Used</span>
            <strong>{formatMinutes(feedStatus.seconds_consumed)}</strong>
          </div>
          <div className="kt-watchtime-bar">
            <div
              className={`kt-watchtime-bar-fill${feedStatus.limit_reached ? " is-limit-reached" : ""}`}
              style={{ width: `${Math.min(100, (feedStatus.seconds_consumed / Math.max(1, feedStatus.limit_seconds)) * 100)}%` }}
            />
          </div>
          <div className="kt-watchtime-reset">
            {feedStatus.limit_reached
              ? "Daily limit reached — thanks for watching with purpose today."
              : `${formatMinutes(feedStatus.seconds_remaining)} left of your ${formatMinutes(feedStatus.limit_seconds)} daily limit`}
          </div>
        </div>
      )}
    </>
  );
}

export function KISTubeShell({
  viewer,
  subscriptions,
  feedStatus,
  children,
}: {
  viewer: KisTubeViewer;
  subscriptions: KisTubeSubscription[];
  feedStatus: KisTubeFeedStatus | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/kistube";
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/kistube/search?q=${encodeURIComponent(trimmed)}`);
  }

  const initial = viewer.signedIn ? (viewer.displayName || "?").trim().charAt(0).toUpperCase() : "";

  return (
    <div className="kt-shell">
      <header className="kt-topbar">
        <button
          type="button"
          className="kt-topbar-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((open) => !open)}
        >
          <MenuIcon />
        </button>
        <Link href="/kistube" className="kt-brand" aria-label="KISTube home">
          <Image src="/kistube/logo-64.png" alt="" width={32} height={32} priority />
          <span className="kt-brand-word">KIS<span className="kt-word-purple">Tube</span></span>
        </Link>
        <div className="kt-topbar-search">
          <form className="kt-search-form" onSubmit={submitSearch} role="search">
            <input
              type="search"
              name="q"
              placeholder="Search KISTube"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search KISTube"
            />
            <button type="submit" aria-label="Search"><SearchIcon /></button>
          </form>
        </div>
        <div className="kt-topbar-actions">
          {viewer.signedIn ? (
            <div className="kt-profile-menu-wrap" ref={profileRef}>
              <button type="button" className="kt-avatar-button" aria-label="Account menu" onClick={() => setProfileOpen((open) => !open)}>
                {viewer.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={viewer.avatarUrl} alt="" className="kt-avatar" />
                ) : (
                  <span className="kt-avatar">{initial}</span>
                )}
              </button>
              <div className={`kt-profile-menu${profileOpen ? " is-open" : ""}`} role="menu">
                <div className="kt-profile-menu-header">
                  <strong>{viewer.displayName}</strong>
                  <span>{viewer.tierName} plan</span>
                </div>
                <Link href="/kistube/you" role="menuitem"><UserIcon className="kt-nav-icon" /> Your channel</Link>
                <Link href="/kistube/history" role="menuitem"><HistoryIcon className="kt-nav-icon" /> Watch history</Link>
                <Link href="/kistube/saved" role="menuitem"><SavedIcon className="kt-nav-icon" /> Saved</Link>
                <Link href="/control" role="menuitem"><SettingsIcon className="kt-nav-icon" /> Settings</Link>
                <div className="kt-profile-menu-divider" />
                <Link href="/login" role="menuitem"><LogOutIcon className="kt-nav-icon" /> Switch account</Link>
              </div>
            </div>
          ) : (
            <Link href="/login?next=/kistube" className="kt-signin-button">Sign in</Link>
          )}
        </div>
      </header>

      <div className="kt-mobile-search">
        <form className="kt-search-form" onSubmit={submitSearch} role="search">
          <input
            type="search"
            placeholder="Search KISTube"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search KISTube"
          />
          <button type="submit" aria-label="Search"><SearchIcon /></button>
        </form>
      </div>

      <nav className="kt-mobile-section-tabs" aria-label="Sections">
        {SECTION_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`kt-filter-chip${pathname.startsWith(link.href) ? " is-active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className={`kt-sidebar-scrim${drawerOpen ? " is-open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`kt-sidebar${drawerOpen ? " is-open" : ""}`} aria-label="KISTube navigation">
        <SidebarContents pathname={pathname} subscriptions={subscriptions} feedStatus={feedStatus} viewer={viewer} />
      </aside>

      <main className="kt-main">{children}</main>

      <nav className="kt-bottom-nav" aria-label="Quick navigation">
        <Link href="/kistube" className={pathname === "/kistube" ? "is-active" : ""}><HomeIcon /> Home</Link>
        <Link href="/kistube/channels" className={pathname.startsWith("/kistube/channels") ? "is-active" : ""}><ChannelsIcon /> Channels</Link>
        <Link href="/kistube/subscriptions" className={pathname.startsWith("/kistube/subscriptions") ? "is-active" : ""}><UserIcon /> Subs</Link>
        <Link href="/kistube/you" className={pathname.startsWith("/kistube/you") ? "is-active" : ""}><UserIcon /> You</Link>
      </nav>
    </div>
  );
}
