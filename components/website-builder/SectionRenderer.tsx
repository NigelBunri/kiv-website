import type { WebsiteBuilderSection } from "@/lib/website-builder-api";
import { BuyButton } from "./BuyButton";

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

function FormSection({ data }: { data: Data }) {
  // Phase 1: render-only, no submission backend (see plan Phase 2/3
  // roadmap) — shown as a static preview of the intended form.
  const fields = Array.isArray(data.fields) ? (data.fields as Data[]) : [];
  return (
    <section className="wb-section wb-form">
      {str(data, "heading") && <h2>{str(data, "heading")}</h2>}
      <form onSubmit={(e) => e.preventDefault()}>
        {fields.map((field, i) => (
          <label key={i}>
            {str(field, "label")}
            <input type="text" disabled placeholder={str(field, "placeholder")} />
          </label>
        ))}
        <button type="submit" disabled>{str(data, "submit_label") || "Submit"}</button>
      </form>
    </section>
  );
}

function KisContentSection({ section }: { section: WebsiteBuilderSection }) {
  const items = section.resolved_items ?? [];
  if (!items.length) return null;
  const heading = str(section.data, "heading");
  const ctaLabel = str(section.data, "cta_label");
  const ctaLink = str(section.data, "cta_deep_link");
  const targetType = str(section.data, "target_type");
  return (
    <section className="wb-section wb-kis-content">
      {heading && <h2>{heading}</h2>}
      <div className="wb-kis-content-grid">
        {items.map((item) => (
          <div key={item.id} className="wb-kis-content-card">
            {item.image_url && (
              <a href={item.deep_link || undefined}>
                <img src={item.image_url} alt={item.title} />
              </a>
            )}
            <h3>{item.title}</h3>
            {item.description && <p>{item.description}</p>}
            {item.price_display && <p className="wb-price">{item.price_display}</p>}
            <BuyButton targetType={targetType} item={item} shopId={item.shop_id} />
          </div>
        ))}
      </div>
      {ctaLabel && ctaLink && <a className="wb-button" href={ctaLink}>{ctaLabel}</a>}
    </section>
  );
}

export function SectionRenderer({ section }: { section: WebsiteBuilderSection }) {
  const data = section.data || {};
  switch (section.type) {
    case "hero": return <HeroSection data={data} />;
    case "text": return <TextSection data={data} />;
    case "image": return <ImageSection data={data} />;
    case "gallery": return <GallerySection data={data} />;
    case "video": return <VideoSection data={data} />;
    case "testimonials": return <TestimonialsSection data={data} />;
    case "faqs": return <FaqsSection data={data} />;
    case "social_links": return <SocialLinksSection data={data} />;
    case "contact_info": return <ContactInfoSection data={data} />;
    case "hours": return <HoursSection data={data} />;
    case "cta": return <CtaSection data={data} />;
    case "map": return <MapSection data={data} />;
    case "form": return <FormSection data={data} />;
    case "kis_content": return <KisContentSection section={section} />;
    default: return null;
  }
}
