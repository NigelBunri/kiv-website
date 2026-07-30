import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { products, site, type Product } from "@/lib/site";

/**
 * Visible breadcrumb trail paired with its BreadcrumbJsonLd — a page's
 * markup and its structured data should describe the same thing, and a
 * JSON-LD-only breadcrumb with no matching visible trail is both a weaker
 * trust signal for Google and a missed internal-link/navigation aid for
 * real visitors. The last item renders as plain text (aria-current="page"),
 * matching how breadcrumbs conventionally treat "you are here".
 */
export function Breadcrumbs({ items }: { items: Array<{ name: string; href: string }> }) {
  return (
    <>
      <nav className="breadcrumb-trail" aria-label="Breadcrumb">
        <ol>
          {items.map((item, index) => (
            <li key={item.href}>
              {index === items.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <>
                  <Link href={item.href}>{item.name}</Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <BreadcrumbJsonLd items={items} />
    </>
  );
}

function stripExt(src: string): string {
  return src.replace(/\.(jpg|jpeg|png)$/i, "");
}

/**
 * Serves the WebP variants scripts/optimize-images.mjs generates (e.g.
 * `foo-480.webp`, `foo-800.webp`, `foo-1200.webp`) via a <picture> element,
 * falling back to the original format at the same widths for browsers
 * without WebP support (vanishingly few today, but this costs nothing to
 * keep). Every hero/story/card image on the site goes through this instead
 * of a single full-resolution <img> — see docs/forms-integration-setup.md's
 * sibling concern: don't ship one desktop-sized asset to every viewport.
 */
function ResponsiveImage({
  src,
  alt,
  widths,
  fallbackExt,
  sizes,
  width,
  height,
  loading,
  fetchPriority,
  className,
}: {
  src: string;
  alt: string;
  widths: number[];
  fallbackExt: "jpg" | "png";
  sizes: string;
  width: number;
  height: number;
  loading: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
}) {
  const base = stripExt(src);
  const largest = widths[widths.length - 1];
  const webpSrcSet = widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  const fallbackSrcSet = widths.map((w) => `${base}-${w}.${fallbackExt} ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        className={className}
        src={`${base}-${largest}.${fallbackExt}`}
        srcSet={fallbackSrcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
      />
    </picture>
  );
}

const VISUAL_WIDTHS = [480, 800, 1200];
const VISUAL_SIZES = "(max-width: 980px) 100vw, 56vw";
const LOGO_WIDTHS = [256, 512];

export function Hero({
  eyebrow,
  title,
  body,
  actions,
  logo,
  visual,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  actions?: Array<{ href: string; label: string; variant?: "primary" | "secondary" }>;
  /** When provided (e.g. on a product page), shows that product's own crest
   *  instead of the generic KCAN/KIV/KIS venture-structure panel — every
   *  page repeating the same panel added little once a page has its own
   *  real mark to show. */
  logo?: { src: string; alt: string };
  visual?: { src: string; alt: string };
}) {
  return (
    <section className={`hero${visual ? " hero--visual" : ""}`}>
      <div className="hero-copy" data-reveal>
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
      {visual ? (
        <div className="hero-visual" data-reveal style={{ "--reveal-delay": "160ms" } as React.CSSProperties}>
          <span className="hero-visual-corner hero-visual-corner--tl" aria-hidden="true" />
          <span className="hero-visual-corner hero-visual-corner--br" aria-hidden="true" />
          <div className="hero-visual-frame">
            <ResponsiveImage
              src={visual.src}
              alt={visual.alt}
              widths={VISUAL_WIDTHS}
              fallbackExt="jpg"
              sizes={VISUAL_SIZES}
              width={1200}
              height={675}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      ) : logo ? (
        <div className="hero-panel hero-panel--logo" data-reveal style={{ "--reveal-delay": "160ms" } as React.CSSProperties}>
          <span className="hero-panel-corner hero-panel-corner--tl" aria-hidden="true" />
          <span className="hero-panel-corner hero-panel-corner--br" aria-hidden="true" />
          <ResponsiveImage
            src={logo.src}
            alt={logo.alt}
            widths={LOGO_WIDTHS}
            fallbackExt="png"
            sizes="240px"
            width={512}
            height={512}
            loading="eager"
            fetchPriority="high"
          />
        </div>
      ) : (
        <div className="hero-panel" aria-label="KIV venture structure" data-reveal style={{ "--reveal-delay": "160ms" } as React.CSSProperties}>
          <span className="hero-panel-corner hero-panel-corner--tl" aria-hidden="true" />
          <span className="hero-panel-corner hero-panel-corner--br" aria-hidden="true" />
          <span>KCAN</span>
          <strong>Parent organisation</strong>
          <span>KIV</span>
          <strong>Business and technology venture</strong>
          <span>KIS</span>
          <strong>First flagship product</strong>
        </div>
      )}
    </section>
  );
}

function HomeHeroIcon({ name }: { name: "people" | "box" | "globe" | "shield" | "spark" }) {
  const paths = {
    people: (
      <>
        <circle cx="8.5" cy="8" r="2.2" />
        <circle cx="15.5" cy="8.8" r="1.8" />
        <path d="M4.2 18.5c.6-3 2.4-4.6 4.4-4.6s3.9 1.6 4.4 4.6M13.4 18.5c.4-2.1 1.7-3.4 3.4-3.4 1.5 0 2.8 1 3.1 2.8" />
      </>
    ),
    box: <path d="m12 3.8 7 3.7-7 3.7-7-3.7 7-3.7Zm-7 7.1 7 3.8 7-3.8M5 14.2l7 3.9 7-3.9" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="8.3" />
        <path d="M3.8 12h16.4M12 3.7c2.1 2.3 3.2 5.1 3.2 8.3s-1.1 6-3.2 8.3M12 3.7C9.9 6 8.8 8.8 8.8 12s1.1 6 3.2 8.3" />
      </>
    ),
    shield: <path d="M12 3.6 18.7 6v5.6c0 4.1-2.5 7.2-6.7 8.8-4.2-1.6-6.7-4.7-6.7-8.8V6L12 3.6Z" />,
    spark: <path d="M12 3.8 13.9 9l5.4 1.9-5.4 1.9L12 18.2l-1.9-5.4-5.4-1.9L10.1 9 12 3.8Z" />,
  } as const;

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <img
        className="home-hero-art"
        src="/images/kiv-home-hero-stage.jpg"
        alt=""
        width={1792}
        height={1024}
        loading="eager"
        fetchPriority="high"
      />
      <div className="home-hero-scrim" aria-hidden="true" />
      <div className="home-hero-copy" data-reveal>
        <p className="home-hero-breadcrumb"><span />KCAN <strong>→</strong> KIV <strong>→</strong> KIS</p>
        <h1 id="home-hero-title">
          Kingdom technology ventures built with <span>clear purpose and responsible impact.</span>
        </h1>
        <p>
          Kingdom Impact Ventures (KIV) is the business and technology venture of KCAN. We build and support ventures in education, market, payments and health — for Kingdom impact.
        </p>
        <div className="home-hero-actions">
          <Link className="home-button home-button--dark" href="/products/kis">View KIS <span aria-hidden="true">→</span></Link>
          <Link className="home-button home-button--light" href="/mission">Explore our mission <span aria-hidden="true">→</span></Link>
        </div>
      </div>

      <div className="home-venture-tag home-venture-tag--education" data-reveal style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
        <span>▰</span>
        <strong>Education</strong>
      </div>
      <div className="home-venture-tag home-venture-tag--market" data-reveal style={{ "--reveal-delay": "260ms" } as React.CSSProperties}>
        <span>◱</span>
        <strong>Market</strong>
      </div>
      <div className="home-venture-tag home-venture-tag--payments" data-reveal style={{ "--reveal-delay": "340ms" } as React.CSSProperties}>
        <span>▭</span>
        <strong>Payments</strong>
      </div>
      <div className="home-venture-tag home-venture-tag--health" data-reveal style={{ "--reveal-delay": "420ms" } as React.CSSProperties}>
        <span>♥</span>
        <strong>Health</strong>
      </div>

      <div className="home-hero-stats" data-reveal style={{ "--reveal-delay": "220ms" } as React.CSSProperties}>
        {[
          { icon: "people" as const, label: "Built for", value: "Kingdom", detail: "Advancing purpose through technology" },
          { icon: "box" as const, label: "Core Ventures", value: "4 Pillars", detail: "Education, Market, Payments, Health" },
          { icon: "globe" as const, label: "Global Vision", value: "Many Nations", detail: "Empowering people and institutions" },
          { icon: "shield" as const, label: "Responsible Impact", value: "Trusted", detail: "Built on integrity and excellence" },
        ].map((item) => (
          <article key={item.label}>
            <HomeHeroIcon name={item.icon} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>

      <Link className="home-kis-card" href="/products/kis" data-reveal style={{ "--reveal-delay": "300ms" } as React.CSSProperties}>
        <div>
          <p>Our flagship product <HomeHeroIcon name="spark" /></p>
          <h2>KIS</h2>
          <span>The first integrated platform for community, connection and Kingdom impact.</span>
          <strong>Learn more <span aria-hidden="true">→</span></strong>
        </div>
        <ResponsiveImage
          className="home-kis-card-logo"
          src="/images/dark-kis-logo.jpg"
          alt="KIS logo"
          widths={LOGO_WIDTHS}
          fallbackExt="png"
          sizes="128px"
          width={512}
          height={512}
          loading="eager"
        />
      </Link>
    </section>
  );
}

export function ImageStory({
  src,
  alt,
  eyebrow,
  title,
  body,
  points,
  reverse = false,
}: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  reverse?: boolean;
}) {
  return (
    <section className={`image-story${reverse ? " image-story--reverse" : ""}`}>
      <div className="image-story-media" data-reveal>
        <ResponsiveImage
          src={src}
          alt={alt}
          widths={VISUAL_WIDTHS}
          fallbackExt="jpg"
          sizes={VISUAL_SIZES}
          width={1200}
          height={675}
          loading="lazy"
        />
      </div>
      <div className="image-story-copy" data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{body}</p>
        <ul>
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Section({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) {
  return (
    <section className="section">
      <div className="section-heading" data-reveal>
        <h2>{title}</h2>
        {body ? <p>{body}</p> : null}
      </div>
      {children}
    </section>
  );
}

function revealDelay(index: number, stepMs = 120, maxMs = 560): React.CSSProperties {
  return { "--reveal-delay": `${Math.min(index * stepMs, maxMs)}ms` } as React.CSSProperties;
}

export function CardGrid({
  items,
}: {
  items: Array<{ title: string; body: string; href?: string; meta?: string; image?: { src: string; alt: string } }>;
}) {
  return (
    <div className="card-grid">
      {items.map((item, index) => {
        const content = (
          <article className="card">
            {item.image ? (
              <ResponsiveImage
                className="card-logo"
                src={item.image.src}
                alt={item.image.alt}
                widths={[200]}
                fallbackExt="png"
                sizes="80px"
                width={80}
                height={80}
                loading="lazy"
              />
            ) : null}
            {item.meta ? <p className="card-meta">{item.meta}</p> : null}
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        );
        return item.href ? (
          <Link key={item.title} href={item.href} className="card-link" data-reveal style={revealDelay(index)}>{content}</Link>
        ) : (
          <div key={item.title} data-reveal style={revealDelay(index)}>{content}</div>
        );
      })}
    </div>
  );
}

export function ProductGrid() {
  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <Link key={product.slug} href={`/products/${product.slug}`} className="product-card" data-reveal style={revealDelay(index)}>
          <ResponsiveImage
            className="product-logo"
            src={`/images/sm/${product.slug}-logo-sm.png`}
            alt={product.fullName}
            widths={[200]}
            fallbackExt="png"
            sizes="64px"
            width={64}
            height={64}
            loading="lazy"
          />
          <span>{product.name}</span>
          <h3>{product.fullName}</h3>
          <p>{product.summary}</p>
          <strong>{product.statusLabel}</strong>
        </Link>
      ))}
    </div>
  );
}

export function DetailList({
  items,
}: {
  items: Array<{ title: string; body: string }>;
}) {
  return (
    <div className="detail-list">
      {items.map((item, index) => (
        <article key={item.title} className="detail-item" data-reveal style={revealDelay(index, 90, 420)}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function Timeline({
  items,
}: {
  items: Array<{ title: string; body: string }>;
}) {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <article key={item.title} className="timeline-item" data-reveal style={revealDelay(index, 120, 520)}>
          <span aria-hidden="true" />
          <div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

const featureIcons = {
  chat: (
    <path d="M4 5.5h16v10H9l-4 4v-4H4Z" />
  ),
  broadcast: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M7.5 8.5a6.2 6.2 0 0 0 0 7M16.5 8.5a6.2 6.2 0 0 1 0 7M4.5 5.5a10.4 10.4 0 0 0 0 13M19.5 5.5a10.4 10.4 0 0 1 0 13" />
    </>
  ),
  group: (
    <>
      <circle cx="8.5" cy="8.5" r="2.5" />
      <circle cx="16" cy="9.5" r="2" />
      <path d="M3.5 19c.6-3 2.6-4.7 5-4.7s4.4 1.7 5 4.7M14 19c.4-2.2 1.9-3.6 3.7-3.6 1.6 0 2.9 1 3.5 2.6" />
    </>
  ),
  book: (
    <path d="M4 5.2c2.2-.8 4.6-.8 8 .6 3.4-1.4 5.8-1.4 8-.6v13.6c-2.2-.8-4.6-.8-8 .6-3.4-1.4-5.8-1.4-8-.6ZM12 5.8v13.6" />
  ),
  store: (
    <path d="M4 9.5 5.2 4h13.6l1.2 5.5M4 9.5v9.5h16V9.5M4 9.5c0 1.5 1.2 2.7 2.7 2.7S9.3 11 9.3 9.5M9.3 9.5c0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7M14.7 9.5c0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7" />
  ),
  sliders: (
    <path d="M5 6h14M5 12h14M5 18h14M8.5 6v0M15 12v0M10.5 18v0" strokeWidth="3.4" strokeLinecap="round" />
  ),
} as const;

export type FeatureIconName = keyof typeof featureIcons;

export function FeatureGrid({
  items,
}: {
  items: Array<{ icon: FeatureIconName; title: string; body: string }>;
}) {
  return (
    <div className="card-grid feature-grid">
      {items.map((item, index) => (
        <article className="card feature-card" key={item.title} data-reveal style={revealDelay(index)}>
          <span className="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {featureIcons[item.icon]}
            </svg>
          </span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}

export function AvailabilityPanel({ product }: { product: Product }) {
  const comingSoon = !product.availability.android && !product.availability.ios && !product.availability.web;
  return (
    <section className="availability-panel" aria-labelledby="availability-title" data-reveal>
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
    <section className="contact-strip" data-reveal>
      <div>
        <h2>Need to reach KIV?</h2>
        <p>Use the correct public form so your request reaches the right workflow without collecting private credentials.</p>
      </div>
      <Link className="button primary" href="/contact">Contact KIV</Link>
      <a className="button secondary" href={`mailto:${site.securityEmail}`}>Security report</a>
    </section>
  );
}
