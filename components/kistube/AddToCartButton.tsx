"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddToCartButton({
  productId,
  shopId,
  signedIn,
  disabled,
}: {
  productId: string;
  shopId: string;
  signedIn: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addToCart() {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/kistube/market")}`);
      return;
    }
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/kistube/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, shop_id: shopId, quantity }),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload?.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
      } else {
        setError(payload?.message || "Couldn't add that to your cart.");
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", alignItems: "flex-start" }}>
      <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
          style={{ width: 64, border: "1.5px solid var(--line)", borderRadius: "var(--radius-sm)", padding: ".45rem .6rem" }}
          aria-label="Quantity"
        />
        <button type="button" className="kt-button kt-button--primary" onClick={addToCart} disabled={pending || disabled}>
          {pending ? "Adding…" : added ? "Added to cart ✓" : "Add to cart"}
        </button>
      </div>
      {error && <p style={{ color: "var(--danger)", fontSize: ".8rem" }}>{error}</p>}
    </div>
  );
}
