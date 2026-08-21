"use client";

import { useState } from "react";
import { useCart } from "./PublicCartProvider";

// Sits alongside BuyButton's existing "Buy now" (single-item, instant
// checkout) as a second option for products specifically — the only
// content type with a cart at all (see PublicCartProvider.tsx). Adding
// requires sign-in same as buying; on a 401 this sends the visitor to
// login exactly like BuyButton's redirectToPayment does.
export function PublicAddToCartButton({ productId }: { productId: string }) {
  const { addItem, busy } = useCart();
  const [status, setStatus] = useState<"idle" | "added" | "error">("idle");
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    const result = await addItem(productId, 1);
    if (result.requiresLogin) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    if (!result.success) {
      setError(result.message || "Unable to add this to your cart.");
      setStatus("error");
      return;
    }
    setStatus("added");
    window.setTimeout(() => setStatus("idle"), 1800);
  }

  return (
    <div className="wb-add-to-cart">
      <button type="button" className="wb-button wb-button--outline" disabled={busy} onClick={handleClick}>
        {status === "added" ? "Added ✓" : "Add to Cart"}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
