import { cloneElement, isValidElement } from "react";
import type { WebsiteBuilderSection } from "@/lib/website-builder-api";
import { PublicFormSection } from "./PublicFormSection";
import { PublicKisContentGrid } from "./PublicKisContentGrid";

// One renderer per section type, dispatched by `type`. Kept in a single
// file deliberately — these are small, purely presentational blocks over
// data the Django backend has already sanitized (safe_public_media_url/
// safe_public_description), not a place for additional business logic.
// `kis_content` is the one section type that renders LIVE KIS data
// (section.resolved_items, resolved server-side on every request — never
// duplicated into this payload) rather than hand-authored `data`.

type Data = Record<string, unknown>;

function str(data: Data, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value : "";
}

function HeroSection({ data }: { data: Data }) {
  const image = str(data, "image_url");
  return (
    <section className="wb-section wb-hero" style={image ? { backgroundImage: `url(${image})` } : undefined}>
      <div className="wb-hero-inner">
        {str(data, "headline") && <h1>{str(data, "headline")}</h1>}
        {str(data, "subheadline") && <p className="wb-hero-subheadline">{str(data, "subheadline")}</p>}
        {str(data, "cta_text") && str(data, "cta_url") && (
          <a className="wb-button" href={str(data, "cta_url")}>{str(data, "cta_text")}</a>
        )}
      </div>
    </section>
  );
}

// hero_banner/about/image_gallery_grid/statistics/programs_services/
// call_to_action/contact_information below are the RN Website Builder
// editor's own section vocabulary (KIS/src/components/section-builder/
// types.ts, reused from the older per-owner-type legacy landing pages),
// accepted verbatim by the Django backend (apps.websites.models.
// SECTION_TYPES) rather than translated into this file's hero/text/
// gallery/cta/contact_info shapes — so these read the RN field names
// directly.
// Each section type's alternate visual designs — the RN Website Builder
// editor's design-picker modal offers exactly these keys (see
// src/components/section-builder/sectionVariants.ts, which must be kept
// in lockstep with this map and with apps.websites.models.SECTION_VARIANTS
// on the backend). "classic" is always variant 1 and is the design every
// section had before variants existed, so old sections with no `variant`
// field keep rendering byte-identical to before.
export const SECTION_VARIANTS: Record<string, string[]> = {
  hero_banner: ["classic", "split_left", "split_right", "bottom_card", "minimal_banner"],
  about: ["classic", "centered_stack", "card_overlap", "bordered_quote", "full_width_banner"],
};

function resolveVariant(type: string, variant: string | undefined): string {
  const options = SECTION_VARIANTS[type];
  if (!options) return "classic";
  return variant && options.includes(variant) ? variant : options[0];
}

function HeroBannerSection({ data, variant }: { data: Data; variant?: string }) {
  const image = str(data, "backgroundImageUrl");
  const title = str(data, "title");
  const subtitle = str(data, "subtitle");
  const ctaText = str(data, "ctaText");
  const ctaLink = str(data, "ctaLink");
  const cta = ctaText && ctaLink ? <a className="wb-button" href={ctaLink}>{ctaText}</a> : null;
  const resolved = resolveVariant("hero_banner", variant);

  if (resolved === "split_left" || resolved === "split_right") {
    return (
      <section className={`wb-section wb-hero-split${resolved === "split_right" ? " wb-hero-split--reverse" : ""}`}>
        {image && <img className="wb-hero-split-image" src={image} alt="" />}
        <div className="wb-hero-split-copy">
          {title && <h1>{title}</h1>}
          {subtitle && <p className="wb-hero-subheadline">{subtitle}</p>}
          {cta}
        </div>
      </section>
    );
  }

  if (resolved === "bottom_card") {
    return (
      <section className="wb-section wb-hero-bottomcard" style={image ? { backgroundImage: `url(${image})` } : undefined}>
        <div className="wb-hero-bottomcard-inner">
          {title && <h1>{title}</h1>}
          {subtitle && <p className="wb-hero-subheadline">{subtitle}</p>}
          {cta}
        </div>
      </section>
    );
  }

  if (resolved === "minimal_banner") {
    return (
      <section className="wb-section wb-hero-minimal">
        {image && <div className="wb-hero-minimal-strip" style={{ backgroundImage: `url(${image})` }} />}
        <div className="wb-hero-minimal-copy">
          {title && <h1>{title}</h1>}
          {subtitle && <p className="wb-hero-subheadline">{subtitle}</p>}
          {cta}
        </div>
      </section>
    );
  }

  return (
    <section className="wb-section wb-hero" style={image ? { backgroundImage: `url(${image})` } : undefined}>
      <div className="wb-hero-inner">
        {title && <h1>{title}</h1>}
        {subtitle && <p className="wb-hero-subheadline">{subtitle}</p>}
        {cta}
      </div>
    </section>
  );
}

function AboutSection({ data, variant }: { data: Data; variant?: string }) {
  const image = str(data, "imageUrl");
  const title = str(data, "title");
  const description = str(data, "description");
  const resolved = resolveVariant("about", variant);

  if (resolved === "centered_stack") {
    return (
      <section className="wb-section wb-about-stack">
        {image && <img className="wb-about-stack-image" src={image} alt="" />}
        <div className="wb-about-stack-copy">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      </section>
    );
  }

  if (resolved === "card_overlap") {
    return (
      <section className="wb-section wb-about-overlap">
        {image && <img className="wb-about-overlap-image" src={image} alt="" />}
        <div className="wb-about-overlap-card">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      </section>
    );
  }

  if (resolved === "bordered_quote") {
    return (
      <section className="wb-section wb-about-quote">
        <div className="wb-about-quote-copy">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
        {image && <img className="wb-about-quote-image" src={image} alt="" />}
      </section>
    );
  }

  if (resolved === "full_width_banner") {
    return (
      <section className="wb-section wb-about-banner">
        {image && <div className="wb-about-banner-image" style={{ backgroundImage: `url(${image})` }} />}
        <div className="wb-about-banner-copy">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      </section>
    );
  }

  const reverse = data.layout === "image_right";
  return (
    <section className={`wb-section wb-about${reverse ? " wb-about--reverse" : ""}`}>
      {image && <img className="wb-about-image" src={image} alt="" />}
      <div className="wb-about-copy">
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}

function ImageGalleryGridSection({ data }: { data: Data }) {
  const images = Array.isArray(data.images) ? (data.images as string[]) : [];
  if (!images.length) return null;
  return (
    <section className="wb-section wb-image-gallery-grid">
      {str(data, "title") && <h2>{str(data, "title")}</h2>}
      <div className="wb-gallery-grid">
        {images.map((url, i) => (
          <img key={i} src={url} alt="" />
        ))}
      </div>
    </section>
  );
}

function StatisticsSection({ data }: { data: Data }) {
  const metrics = Array.isArray(data.metrics) ? (data.metrics as Data[]) : [];
  if (!metrics.length) return null;
  return (
    <section className="wb-section wb-statistics">
      {str(data, "title") && <h2>{str(data, "title")}</h2>}
      <div className="wb-stats-grid">
        {metrics.map((metric, i) => (
          <div key={i} className="wb-stat">
            <strong>{str(metric, "value")}</strong>
            <span>{str(metric, "label")}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProgramsServicesSection({ data }: { data: Data }) {
  const cards = Array.isArray(data.cards) ? (data.cards as Data[]) : [];
  if (!cards.length) return null;
  return (
    <section className="wb-section wb-programs-services">
      {str(data, "title") && <h2>{str(data, "title")}</h2>}
      <div className="wb-cards-grid">
        {cards.map((card, i) => (
          <div key={i} className="wb-card">
            <h3>{str(card, "name")}</h3>
            {str(card, "description") && <p>{str(card, "description")}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function CallToActionSection({ data }: { data: Data }) {
  if (!str(data, "buttonLink")) return null;
  return (
    <section className="wb-section wb-cta">
      {str(data, "title") && <h2>{str(data, "title")}</h2>}
      {str(data, "description") && <p>{str(data, "description")}</p>}
      <a className="wb-button" href={str(data, "buttonLink")}>{str(data, "buttonText") || "Learn more"}</a>
    </section>
  );
}

function ContactInformationSection({ data }: { data: Data }) {
  return (
    <section className="wb-section wb-contact-information">
      {str(data, "title") && <h2>{str(data, "title")}</h2>}
      {str(data, "phone") && <p>Phone: {str(data, "phone")}</p>}
      {str(data, "email") && <p>Email: {str(data, "email")}</p>}
      {str(data, "address") && <p>{str(data, "address")}</p>}
    </section>
  );
}

function TextSection({ data }: { data: Data }) {
  return (
    <section className="wb-section wb-text">
      {str(data, "heading") && <h2>{str(data, "heading")}</h2>}
      {str(data, "body") && <p>{str(data, "body")}</p>}
    </section>
  );
}

function ImageSection({ data }: { data: Data }) {
  const url = str(data, "image_url");
  if (!url) return null;
  return (
    <section className="wb-section wb-image">
      <img src={url} alt={str(data, "alt") || str(data, "caption") || ""} />
      {str(data, "caption") && <p className="wb-caption">{str(data, "caption")}</p>}
    </section>
  );
}

function GallerySection({ data }: { data: Data }) {
  const items = Array.isArray(data.items) ? (data.items as Data[]) : [];
  if (!items.length) return null;
  return (
    <section className="wb-section wb-gallery">
      <div className="wb-gallery-grid">
        {items.map((item, i) => (
          <figure key={i}>
            <img src={str(item, "image_url")} alt={str(item, "caption") || ""} />
            {str(item, "caption") && <figcaption>{str(item, "caption")}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}

function VideoSection({ data }: { data: Data }) {
  const url = str(data, "video_url");
  if (!url) return null;
  return (
    <section className="wb-section wb-video">
      <video controls src={url} poster={str(data, "thumbnail_url") || undefined} />
    </section>
  );
}

function TestimonialsSection({ data }: { data: Data }) {
  const items = Array.isArray(data.items) ? (data.items as Data[]) : [];
  if (!items.length) return null;
  return (
    <section className="wb-section wb-testimonials">
      <div className="wb-testimonials-grid">
        {items.map((item, i) => (
          <blockquote key={i}>
            <p>&ldquo;{str(item, "quote")}&rdquo;</p>
            <footer>{str(item, "author")}{str(item, "role") ? `, ${str(item, "role")}` : ""}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function FaqsSection({ data }: { data: Data }) {
  const items = Array.isArray(data.items) ? (data.items as Data[]) : [];
  if (!items.length) return null;
  return (
    <section className="wb-section wb-faqs">
      {items.map((item, i) => (
        <details key={i}>
          <summary>{str(item, "question")}</summary>
          <p>{str(item, "answer")}</p>
        </details>
      ))}
    </section>
  );
}

function SocialLinksSection({ data }: { data: Data }) {
  const links = Array.isArray(data.links) ? (data.links as Data[]) : [];
  if (!links.length) return null;
  return (
    <section className="wb-section wb-social-links">
      {links.map((link, i) => (
        <a key={i} href={str(link, "url")} target="_blank" rel="noreferrer noopener">
          {str(link, "label") || str(link, "platform")}
        </a>
      ))}
    </section>
  );
}

function ContactInfoSection({ data }: { data: Data }) {
  return (
    <section className="wb-section wb-contact-info">
      {str(data, "phone") && <p>Phone: {str(data, "phone")}</p>}
      {str(data, "email") && <p>Email: {str(data, "email")}</p>}
      {str(data, "website_url") && <p>Web: {str(data, "website_url")}</p>}
      {str(data, "whatsapp") && <p>WhatsApp: {str(data, "whatsapp")}</p>}
    </section>
  );
}

function HoursSection({ data }: { data: Data }) {
  const days = Array.isArray(data.days) ? (data.days as Data[]) : [];
  if (!days.length) return null;
  return (
    <section className="wb-section wb-hours">
      <ul>
        {days.map((d, i) => (
          <li key={i}>{str(d, "day")}: {str(d, "hours")}</li>
        ))}
      </ul>
    </section>
  );
}

function CtaSection({ data }: { data: Data }) {
  if (!str(data, "url")) return null;
  return (
    <section className="wb-section wb-cta">
      {str(data, "heading") && <h2>{str(data, "heading")}</h2>}
      <a className="wb-button" href={str(data, "url")}>{str(data, "label") || "Learn more"}</a>
    </section>
  );
}

function MapSection({ data }: { data: Data }) {
  const parts = ["line_one", "line_two", "city", "state", "postal_code", "country"].map((k) => str(data, k)).filter(Boolean);
  if (!parts.length) return null;
  return (
    <section className="wb-section wb-map">
      <address>{parts.join(", ")}</address>
    </section>
  );
}


// Mirrors apps.websites.embeds._PROVIDER_URL_PATTERNS on the backend —
// re-validated here too (not just trusted from the API response) since
// this directly controls an iframe src; a stale/malformed record should
// never render, not just fail to have been saved in the first place.
const EMBED_URL_PATTERNS: Record<string, RegExp> = {
  youtube: /^https:\/\/www\.youtube(-nocookie)?\.com\/embed\/[\w-]+/,
  vimeo: /^https:\/\/player\.vimeo\.com\/video\/\d+/,
  calendly: /^https:\/\/calendly\.com\/[\w./-]+/,
  google_maps: /^https:\/\/www\.google\.com\/maps\/embed/,
  google_calendar: /^https:\/\/calendar\.google\.com\/calendar\/embed/,
  spotify: /^https:\/\/open\.spotify\.com\/embed\//,
  loom: /^https:\/\/www\.loom\.com\/embed\/[\w-]+/,
};

function EmbedSection({ data }: { data: Data }) {
  const provider = str(data, "provider");
  const url = str(data, "url");
  const pattern = EMBED_URL_PATTERNS[provider];
  if (!pattern || !pattern.test(url)) return null;
  return (
    <section className="wb-section wb-embed">
      {str(data, "title") && <h2>{str(data, "title")}</h2>}
      <div className="wb-embed-frame">
        <iframe
          src={url}
          title={str(data, "title") || provider}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}

function KisVideoSection({ section }: { section: WebsiteBuilderSection }) {
  const video = section.resolved_video;
  if (!video || !video.video_url) return null;
  return (
    <section className="wb-section wb-kis-video">
      {video.title && <h2>{video.title}</h2>}
      <video
        className="wb-kis-video-player"
        controls
        preload="metadata"
        poster={video.thumbnail_url || undefined}
        src={video.video_url}
      >
        Your browser doesn&apos;t support embedded video.
      </video>
      {video.description && <p className="wb-kis-video-description">{video.description}</p>}
    </section>
  );
}

function KisContentSection({ section, siteSlug, pageSlug }: { section: WebsiteBuilderSection; siteSlug: string; pageSlug: string }) {
  const items = section.resolved_items ?? [];
  if (!items.length) return null;
  const heading = str(section.data, "heading");
  const ctaLabel = str(section.data, "cta_label");
  const ctaLink = str(section.data, "cta_deep_link");
  const targetType = str(section.data, "target_type");
  return (
    <section className="wb-section wb-kis-content">
      {heading && <h2>{heading}</h2>}
      <PublicKisContentGrid
        items={items}
        hasMore={Boolean(section.has_more)}
        targetType={targetType}
        siteSlug={siteSlug}
        pageSlug={pageSlug}
        sectionId={section.id}
      />
      {ctaLabel && ctaLink && <a className="wb-button" href={ctaLink}>{ctaLabel}</a>}
    </section>
  );
}

function renderSectionByType({
  section, siteSlug, pageSlug,
}: {
  section: WebsiteBuilderSection;
  siteSlug?: string;
  pageSlug?: string;
}) {
  const data = section.data || {};
  switch (section.type) {
    case "hero": return <HeroSection data={data} />;
    case "hero_banner": return <HeroBannerSection data={data} variant={section.variant} />;
    case "text": return <TextSection data={data} />;
    case "about": return <AboutSection data={data} variant={section.variant} />;
    case "image": return <ImageSection data={data} />;
    case "gallery": return <GallerySection data={data} />;
    case "image_gallery_grid": return <ImageGalleryGridSection data={data} />;
    case "video": return <VideoSection data={data} />;
    case "testimonials": return <TestimonialsSection data={data} />;
    case "statistics": return <StatisticsSection data={data} />;
    case "programs_services": return <ProgramsServicesSection data={data} />;
    case "faqs": return <FaqsSection data={data} />;
    case "social_links": return <SocialLinksSection data={data} />;
    case "contact_info": return <ContactInfoSection data={data} />;
    case "contact_information": return <ContactInformationSection data={data} />;
    case "hours": return <HoursSection data={data} />;
    case "cta": return <CtaSection data={data} />;
    case "call_to_action": return <CallToActionSection data={data} />;
    case "map": return <MapSection data={data} />;
    case "embed": return <EmbedSection data={data} />;
    case "kis_video": return <KisVideoSection section={section} />;
    case "form":
      return siteSlug && pageSlug
        ? <PublicFormSection data={data} sectionId={section.id} siteSlug={siteSlug} pageSlug={pageSlug} />
        : null;
    case "kis_content": return <KisContentSection section={section} siteSlug={siteSlug || ""} pageSlug={pageSlug || ""} />;
    default: return null;
  }
}

function responsiveClassName(hiddenOn: Array<"mobile" | "desktop"> | undefined): string {
  if (!hiddenOn || !hiddenOn.length) return "";
  return hiddenOn.map((bp) => (bp === "mobile" ? "wb-hide-mobile" : "wb-hide-desktop")).join(" ");
}

export function SectionRenderer({
  section, siteSlug, pageSlug,
}: {
  section: WebsiteBuilderSection;
  /** Only `form` sections need these — used to build the submit proxy
   * URL (/api/website-forms/[siteSlug]/[pageSlug]/[sectionId]). */
  siteSlug?: string;
  pageSlug?: string;
}) {
  const rendered = renderSectionByType({ section, siteSlug, pageSlug });
  if (!isValidElement(rendered)) return rendered;
  const extraClassName = responsiveClassName(section.responsive?.hidden_on);
  if (!extraClassName) return rendered;
  const existingClassName = (rendered.props as { className?: string }).className || "";
  return cloneElement(rendered, { className: `${existingClassName} ${extraClassName}`.trim() } as Record<string, unknown>);
}
