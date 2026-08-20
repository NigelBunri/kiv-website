import Link from "next/link";
import type { WebsiteBuilderSite } from "@/lib/website-builder-api";

// Every website-builder site gets this header — previously WebsitePageView
// only rendered a bare, unstyled page-switcher <nav> and only when a site
// had more than one page, so a single-page site (the common case) showed
// no header at all: no site name, no logo, nothing a visitor would
// recognize as "this is a real website." Site name is always shown;
// the page list only adds nav links once there's more than one page.
export function WebsiteHeader({ site, currentSlug }: { site: WebsiteBuilderSite; currentSlug: string }) {
  const logoUrl = typeof site.branding?.logo_url === "string" ? (site.branding.logo_url as string) : "";
  const initial = (site.name || "?").trim().charAt(0).toUpperCase() || "?";
  const homeHref = `/page/${site.slug}`;

  return (
    <header className="wb-site-header">
      <Link href={homeHref} className="wb-site-brand">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="wb-site-brand-mark" />
        ) : (
          <span className="wb-site-brand-mark wb-site-brand-mark--letter" aria-hidden="true">{initial}</span>
        )}
        <span className="wb-site-brand-name">{site.name}</span>
      </Link>
      {site.pages.length > 1 && (
        <nav className="wb-site-nav" aria-label={`${site.name} pages`}>
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
    </header>
  );
}
