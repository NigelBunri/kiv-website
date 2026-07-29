import Link from "next/link";
import { products, site, type Product } from "@/lib/site";

export function Hero({
  eyebrow,
  title,
  body,
  actions,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  actions?: Array<{ href: string; label: string; variant?: "primary" | "secondary" }>;
}) {
  return (
    <section className="hero">
      <div className="hero-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p>{body}</p>
        {actions?.length ? (
          <div className="action-row">
            {actions.map((action) => (
              <Link key={action.href} className={`button ${action.variant ?? "secondary"}`} href={action.href}>
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      <div className="hero-panel" aria-label="KIV venture structure">
        <span>KCAN</span>
        <strong>Parent organisation</strong>
        <span>KIV</span>
        <strong>Business and technology venture</strong>
        <span>KIS</span>
        <strong>First flagship product</strong>
      </div>
    </section>
  );
}

export function Section({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) {
  return (
    <section className="section">
      <div className="section-heading">
        <h2>{title}</h2>
        {body ? <p>{body}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function CardGrid({ items }: { items: Array<{ title: string; body: string; href?: string; meta?: string }> }) {
  return (
    <div className="card-grid">
      {items.map((item) => {
        const content = (
          <article className="card">
            {item.meta ? <p className="card-meta">{item.meta}</p> : null}
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        );
        return item.href ? <Link key={item.title} href={item.href} className="card-link">{content}</Link> : <div key={item.title}>{content}</div>;
      })}
    </div>
  );
}

export function ProductGrid() {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <Link key={product.slug} href={`/products/${product.slug}`} className="product-card">
          <span>{product.name}</span>
          <h3>{product.fullName}</h3>
          <p>{product.summary}</p>
          <strong>{product.statusLabel}</strong>
        </Link>
      ))}
    </div>
  );
}

export function AvailabilityPanel({ product }: { product: Product }) {
  const comingSoon = !product.availability.android && !product.availability.ios && !product.availability.web;
  return (
    <section className="availability-panel" aria-labelledby="availability-title">
      <div>
        <p className="eyebrow">Availability</p>
        <h2 id="availability-title">{product.name} release actions</h2>
        <p>
          Availability is controlled by configuration. The website hides store or web-app links unless official URLs are supplied.
        </p>
      </div>
      <div className="availability-actions">
        {product.availability.android && product.availability.googlePlayUrl ? (
          <a className="button primary" href={product.availability.googlePlayUrl} rel="noopener noreferrer" target="_blank">Open Google Play</a>
        ) : null}
        {product.availability.ios && product.availability.appStoreUrl ? (
          <a className="button primary" href={product.availability.appStoreUrl} rel="noopener noreferrer" target="_blank">Open App Store</a>
        ) : null}
        {product.availability.web && product.availability.webAppUrl ? (
          <a className="button primary" href={product.availability.webAppUrl} rel="noopener noreferrer" target="_blank">Open web app</a>
        ) : null}
        {product.availability.launchList || comingSoon ? <Link className="button secondary" href="/download">Join launch list</Link> : null}
        {comingSoon ? <p className="status-note">Store links will appear here only after official release links are configured.</p> : null}
      </div>
    </section>
  );
}

export function ContactStrip() {
  return (
    <section className="contact-strip">
      <div>
        <h2>Need to reach KIV?</h2>
        <p>Use the correct public form so your request reaches the right workflow without collecting private credentials.</p>
      </div>
      <Link className="button primary" href="/contact">Contact KIV</Link>
      <a className="button secondary" href={`mailto:${site.securityEmail}`}>Security report</a>
    </section>
  );
}
