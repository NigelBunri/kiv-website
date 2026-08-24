"use client";

import { useState } from "react";
import type { WebsiteBuilderKisContentItem } from "@/lib/website-builder-api";

type Props = {
  targetType: string;
  item: WebsiteBuilderKisContentItem;
  shopId?: string;
};

type Status = "idle" | "pending" | "error" | "enrolled";

// The "Buy"/"Book Now"/"Enroll" action on a live KIS-content card.
// Deliberately branches per target_type rather than being one generic
// "purchase" call - products/services/courses each hit a different
// Django endpoint with a different payload shape (see the three
// app/api/checkout/* routes). Anything not purchasable on-site (health
// services, channels, posts, events, testimonials) falls back to the
// existing deep_link into the app - unchanged from Phase 1.
export function BuyButton({ targetType, item, shopId }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  async function redirectToPayment(endpoint: string, body: Record<string, unknown>) {
    setStatus("pending");
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.status === 401 && data?.requiresLogin) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }
      if (!data.success) {
        setError(data.message || "That didn't work - please try again.");
        setStatus("error");
        return;
      }
      if (data.enrolled) {
        setStatus("enrolled");
        return;
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      setError("Checkout couldn't be started for this item.");
      setStatus("error");
    } catch {
      setError("Something went wrong - please try again.");
      setStatus("error");
    }
  }

  if (targetType === "product") {
    return (
      <div className="wb-buy">
        <button
          type="button"
          className="wb-button"
          disabled={status === "pending"}
          onClick={() => redirectToPayment("/api/checkout/product", { shopId, productId: item.id, quantity: 1 })}
        >
          {status === "pending" ? "Starting checkout…" : "Buy now"}
        </button>
        {error ? <p className="field-error">{error}</p> : null}
      </div>
    );
  }

  if (targetType === "shop_service") {
    if (!showScheduler) {
      return (
        <div className="wb-buy">
          <button type="button" className="wb-button" onClick={() => setShowScheduler(true)}>Book now</button>
        </div>
      );
    }
    return (
      <div className="wb-buy wb-buy-scheduler">
        <label>
          Choose a date &amp; time
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </label>
        <button
          type="button"
          className="wb-button"
          disabled={!scheduledAt || status === "pending"}
          onClick={() => redirectToPayment("/api/checkout/service", { serviceId: item.id, scheduledAt: new Date(scheduledAt).toISOString() })}
        >
          {status === "pending" ? "Booking…" : "Confirm booking"}
        </button>
        {error ? <p className="field-error">{error}</p> : null}
      </div>
    );
  }

  if (targetType === "course") {
    const checkoutContentId = (item as { checkout_content_id?: string | null }).checkout_content_id;
    if (status === "enrolled") {
      return <p className="wb-price">You&apos;re enrolled - check the KIS app to start learning.</p>;
    }
    return (
      <div className="wb-buy">
        <button
          type="button"
          className="wb-button"
          disabled={status === "pending" || !checkoutContentId}
          onClick={() => redirectToPayment("/api/checkout/course", { checkoutContentId })}
        >
          {status === "pending" ? "Enrolling…" : "Enroll"}
        </button>
        {!checkoutContentId ? <p className="field-error">Not available for online enrollment yet.</p> : null}
        {error ? <p className="field-error">{error}</p> : null}
      </div>
    );
  }

  // health_service, broadcast_channel, post, event, testimonial - no
  // on-site checkout surface for these (see the website-builder plan's
  // "Health checkout" scope note); the deep_link already rendered on the
  // card is the only action for these types.
  return null;
}
