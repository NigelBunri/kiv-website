"use client";

// Thin rotating announcement strip, typically the very first thing on
// the page (above WebsiteHeader - see WebsitePageView.tsx). Field names
// (messages[].text|link, intervalSeconds) match the RN Website Builder
// editor's `promo_bar` section vocabulary exactly (KIS/src/components/
// section-builder/types.ts's PromoBarSectionData).
import { useEffect, useState } from "react";

type Message = { id?: string; text?: string; link?: string };

type Props = { data: Record<string, unknown> };

export function PublicPromoBar({ data }: Props) {
  const messages = Array.isArray(data.messages) ? (data.messages as Message[]).filter((m) => m?.text) : [];
  const intervalMs = Math.max(2, Math.min(30, Number(data.intervalSeconds) || 4)) * 1000;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % messages.length), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, messages.length]);

  if (!messages.length) return null;
  const current = messages[active];
  const content = <span key={active} className="wb-promo-bar-message">{current.text}</span>;

  return (
    <div className="wb-promo-bar" role="status">
      {current.link ? <a href={current.link} className="wb-promo-bar-link">{content}</a> : content}
    </div>
  );
}
