import Link from "next/link";
import type { WebsiteBuilderSite } from "@/lib/website-builder-api";

// No website-builder page has ever rendered a footer — the page just
// ended after the last section. Real sites (and the main KIV marketing
// site this reuses design tokens from) all have one: at minimum, a way
// back to other pages and a sense of whose site this is.
export function WebsiteFooter({ site }: { site: WebsiteBuilderSite }) {
  const year = new Date().getFullYear();
  return (
    <footer className="wb-site-footer">
      <div className="wb-site-footer-brand">
        <strong>{site.name}</strong>
        {site.seo?.description ? <p>{site.seo.description}</p> : null}
      </div>
      {site.pages.length > 1 && (
        <nav className="wb-site-footer-nav" aria-label={`${site.name} pages`}>
          {site.pages.map((p) => (
            <Link key={p.slug} href={p.is_home ? `/page/${site.slug}` : `/page/${site.slug}/${p.slug}`}>
              {p.title}
            </Link>
          ))}
        </nav>
      )}
      <p className="wb-site-footer-credit">
        © {year} {site.name} · Built with{" "}
        <a href="https://kingdomimpactventures.org" target="_blank" rel="noopener noreferrer">
          Kingdom Impact Ventures
        </a>
      </p>
    </footer>
  );
}
