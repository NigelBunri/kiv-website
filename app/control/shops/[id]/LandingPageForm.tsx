"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LandingPage = {
  headline?: string;
  subheadline?: string;
  hero_image_url?: string;
  hero_cta_text?: string;
  hero_cta_url?: string;
  is_public?: boolean;
  is_published?: boolean;
};

export default function LandingPageForm({ shopId, initialLandingPage }: { shopId: string; initialLandingPage: LandingPage }) {
  const router = useRouter();
  const [headline, setHeadline] = useState(initialLandingPage.headline || "");
  const [subheadline, setSubheadline] = useState(initialLandingPage.subheadline || "");
  const [heroImageUrl, setHeroImageUrl] = useState(initialLandingPage.hero_image_url || "");
  const [heroCtaText, setHeroCtaText] = useState(initialLandingPage.hero_cta_text || "");
  const [heroCtaUrl, setHeroCtaUrl] = useState(initialLandingPage.hero_cta_url || "");
  const [isPublic, setIsPublic] = useState(Boolean(initialLandingPage.is_public));
  const [isPublished, setIsPublished] = useState(Boolean(initialLandingPage.is_published));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/shops/${shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landing_page: {
            headline,
            subheadline,
            hero_image_url: heroImageUrl,
            hero_cta_text: heroCtaText,
            hero_cta_url: heroCtaUrl,
          },
          landing_is_public: isPublic,
          landing_is_published: isPublished,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save landing page.");
      setMessage({ kind: "success", text: "Landing page saved." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save landing page." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="control-section">
      <h2>Landing page</h2>
      <p>The public storefront page shown when someone visits this shop.</p>
      <form className="control-form" onSubmit={handleSave}>
        <label>Headline<input value={headline} onChange={(e) => setHeadline(e.target.value)} /></label>
        <label>Subheadline<textarea rows={2} value={subheadline} onChange={(e) => setSubheadline(e.target.value)} /></label>
        <label>Hero image URL<input type="url" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://…" /></label>
        {heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImageUrl} alt="Hero preview" style={{ width: "100%", maxWidth: "480px", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" }} />
        ) : null}
        <label>Call-to-action text<input value={heroCtaText} onChange={(e) => setHeroCtaText(e.target.value)} placeholder="Shop now" /></label>
        <label>Call-to-action link<input type="url" value={heroCtaUrl} onChange={(e) => setHeroCtaUrl(e.target.value)} placeholder="https://…" /></label>
        <label>
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Public (visible to anyone with the link)
        </label>
        <label>
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /> Published (live)
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={saving}>{saving ? "Saving…" : "Save landing page"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
