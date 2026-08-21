"use client";

import { useState } from "react";
import { useCart } from "./PublicCartProvider";

export function PublicCartDrawer() {
  const { cart, isOpen, busy, closeCart, updateItem, removeItem, checkout } = useCart();
  const [checkoutError, setCheckoutError] = useState("");
  const items = cart?.items ?? [];

  async function handleCheckout() {
    setCheckoutError("");
    const result = await checkout();
    if (!result.success) setCheckoutError(result.message || "Unable to check out.");
  }

  return (
    <>
      <div className={`wb-cart-scrim${isOpen ? " wb-cart-scrim--open" : ""}`} onClick={closeCart} aria-hidden="true" />
      <aside className={`wb-cart-drawer${isOpen ? " wb-cart-drawer--open" : ""}`} aria-hidden={!isOpen} aria-label="Shopping cart">
        <div className="wb-cart-drawer-header">
          <span>Your Cart</span>
          <button type="button" className="wb-cart-drawer-close" onClick={closeCart} aria-label="Close cart">×</button>
        </div>
        {items.length === 0 ? (
          <p className="wb-cart-empty">Your cart is empty.</p>
        ) : (
          <div className="wb-cart-items">
            {items.map((item) => (
              <div key={item.id} className="wb-cart-item">
                {item.product_image ? <img src={item.product_image} alt="" className="wb-cart-item-image" /> : <div className="wb-cart-item-image" aria-hidden="true" />}
                <div className="wb-cart-item-copy">
                  <span className="wb-cart-item-title">{item.product_name}</span>
                  <span className="wb-cart-item-price">{item.price_snapshot}</span>
                  <div className="wb-cart-item-qty">
                    <button type="button" disabled={busy || item.quantity <= 1} onClick={() => updateItem(item.id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                    <span>{item.quantity}</span>
                    <button type="button" disabled={busy} onClick={() => updateItem(item.id, item.quantity + 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <button type="button" className="wb-cart-item-remove" disabled={busy} onClick={() => removeItem(item.id)} aria-label={`Remove ${item.product_name}`}>Remove</button>
              </div>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <div className="wb-cart-drawer-footer">
            <div className="wb-cart-subtotal">
              <span>Subtotal</span>
              <span>{cart?.subtotal}</span>
            </div>
            {checkoutError ? <p className="field-error">{checkoutError}</p> : null}
            <button type="button" className="wb-button wb-cart-checkout" disabled={busy} onClick={handleCheckout}>
              {busy ? "Starting checkout…" : "Checkout"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
