"use client";

import { useState } from "react";
import Link from "next/link";

type CartItem = {
  id: string;
  product: string;
  quantity: number;
  product_name?: string;
  product_image?: string;
  price_snapshot: string;
};

type CartData = {
  id: string;
  shop: string;
  shop_info?: { id: string; name: string; slug?: string; image_url?: string } | null;
  subtotal: string;
  items: CartItem[];
};

export function CartShopSection({ cart: initialCart }: { cart: CartData }) {
  const [cart, setCart] = useState(initialCart);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function recomputeSubtotal(items: CartItem[]): string {
    const total = items.reduce((sum, item) => sum + Number(item.price_snapshot || 0) * item.quantity, 0);
    return total.toFixed(2);
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return removeItem(itemId);
    setPendingItemId(itemId);
    const prev = cart;
    setCart((current) => {
      const items = current.items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
      return { ...current, items, subtotal: recomputeSubtotal(items) };
    });
    try {
      const res = await fetch(`/api/kistube/cart-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) setCart(prev);
    } catch {
      setCart(prev);
    } finally {
      setPendingItemId(null);
    }
  }

  async function removeItem(itemId: string) {
    setPendingItemId(itemId);
    const prev = cart;
    setCart((current) => {
      const items = current.items.filter((item) => item.id !== itemId);
      return { ...current, items, subtotal: recomputeSubtotal(items) };
    });
    try {
      const res = await fetch(`/api/kistube/cart-items/${itemId}`, { method: "DELETE" });
      if (!res.ok) setCart(prev);
    } catch {
      setCart(prev);
    } finally {
      setPendingItemId(null);
    }
  }

  async function checkout() {
    if (checkingOut || cart.items.length === 0) return;
    setCheckingOut(true);
    setError(null);
    try {
      const res = await fetch("/api/kistube/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: cart.shop,
          items: cart.items.map((item) => ({ product_id: item.product, quantity: item.quantity })),
          metadata: { cart_id: cart.id, source: "kistube_market" },
        }),
      });
      const payload = await res.json().catch(() => ({}));
      const order = payload?.data;
      if (res.ok && order?.metadata?.payment_url) {
        window.location.href = order.metadata.payment_url;
      } else if (res.ok && order) {
        // Free/zero-payment order (e.g. legacy wallet path) - no redirect needed.
        window.location.href = "/kistube/market";
      } else {
        setError(payload?.message || "Couldn't start checkout for this order.");
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setCheckingOut(false);
    }
  }

  if (cart.items.length === 0) return null;

  return (
    <div style={{ border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".75rem" }}>
        {cart.shop_info ? (
          <Link href={`/kistube/market/shop/${cart.shop_info.id}`} style={{ fontWeight: 700, textDecoration: "none", color: "inherit" }}>
            {cart.shop_info.name}
          </Link>
        ) : (
          <span style={{ fontWeight: 700 }}>Shop</span>
        )}
        <span className="kt-card-meta">{cart.items.length} item{cart.items.length === 1 ? "" : "s"}</span>
      </div>

      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: ".75rem" }}>
        {cart.items.map((item) => (
          <li key={item.id} style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--cream-2)", flexShrink: 0 }}>
              {item.product_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.product_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : null}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link href={`/kistube/market/product/${item.product}`} style={{ fontWeight: 600, textDecoration: "none", color: "inherit" }}>
                {item.product_name || "Product"}
              </Link>
              <div className="kt-card-meta">${item.price_snapshot} each</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
              <button
                type="button"
                className="kt-button kt-button--outline"
                style={{ padding: ".2rem .6rem" }}
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={pendingItemId === item.id}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
              <button
                type="button"
                className="kt-button kt-button--outline"
                style={{ padding: ".2rem .6rem" }}
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={pendingItemId === item.id}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              disabled={pendingItemId === item.id}
              style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: ".8rem" }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: ".75rem", borderTop: "1px solid var(--line-soft)" }}>
        <strong>Subtotal: ${cart.subtotal}</strong>
        <button type="button" className="kt-button kt-button--primary" onClick={checkout} disabled={checkingOut}>
          {checkingOut ? "Starting checkout…" : "Checkout"}
        </button>
      </div>
      {error && <p style={{ color: "var(--danger)", fontSize: ".8rem", marginTop: ".5rem" }}>{error}</p>}
    </div>
  );
}
