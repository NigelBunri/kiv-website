"use client";

import { useCart } from "./PublicCartProvider";

export function PublicCartIcon() {
  const { cart, openCart } = useCart();
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <button type="button" className="wb-cart-icon" onClick={openCart} aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}>
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1.4" />
        <circle cx="19" cy="21" r="1.4" />
        <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" />
      </svg>
      {count > 0 ? <span className="wb-cart-icon-badge">{count}</span> : null}
    </button>
  );
}
