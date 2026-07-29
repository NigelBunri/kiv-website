import Link from "next/link";
import { nav, site, utilityRoutes } from "@/lib/site";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Kingdom Impact Ventures home">
          <span className="brand-mark" aria-hidden="true">KIV</span>
          <span>
            <strong>{site.name}</strong>
            <small>Business and technology venture of KCAN</small>
          </span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
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
