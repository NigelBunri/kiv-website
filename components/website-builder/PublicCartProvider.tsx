"use client";

// Shared cart state for one shop's storefront — wraps WebsitePageView and
// WebsiteItemDetailView (the two places a product can be added from) so
// the header's cart icon and every "Add to Cart" button stay in sync.
// Talks to the app/api/cart/* proxy routes, which talk to the same
// Cart/CartItem models the RN app's own per-shop cart already uses.
import { createContext, useCallback, useContext, useState } from "react";

export type CartItem = {
  id: string;
  product: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price_snapshot: string;
  stock_snapshot: number;
};

export type CartState = {
  id: string;
  items: CartItem[];
  subtotal: string;
} | null;

type ActionResult = { success: boolean; message?: string; requiresLogin?: boolean };

type CartContextValue = {
  cart: CartState;
  isOpen: boolean;
  busy: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => Promise<ActionResult>;
  updateItem: (itemId: string, quantity: number) => Promise<ActionResult>;
  removeItem: (itemId: string) => Promise<ActionResult>;
  checkout: () => Promise<ActionResult>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ shopId, children }: { shopId: string; children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const fetchCart = useCallback(async (): Promise<ActionResult & { cart?: CartState }> => {
    const res = await fetch(`/api/cart?shopId=${encodeURIComponent(shopId)}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (data.success) setCart(data.cart);
    return data;
  }, [shopId]);

  const addItem = useCallback(async (productId: string, quantity = 1): Promise<ActionResult> => {
    setBusy(true);
    try {
      const ensured = await fetchCart();
      if (!ensured.success || !ensured.cart) {
        return { success: false, message: ensured.message, requiresLogin: ensured.requiresLogin };
      }
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: ensured.cart.id, productId, quantity }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        await fetchCart();
        setIsOpen(true);
      }
      return data;
    } finally {
      setBusy(false);
    }
  }, [fetchCart]);

  const updateItem = useCallback(async (itemId: string, quantity: number): Promise<ActionResult> => {
    setBusy(true);
    try {
      const res = await fetch(`/api/cart/items/${encodeURIComponent(itemId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) await fetchCart();
      return data;
    } finally {
      setBusy(false);
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId: string): Promise<ActionResult> => {
    setBusy(true);
    try {
      const res = await fetch(`/api/cart/items/${encodeURIComponent(itemId)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (data.success) await fetchCart();
      return data;
    } finally {
      setBusy(false);
    }
  }, [fetchCart]);

  const checkout = useCallback(async (): Promise<ActionResult> => {
    if (!cart || cart.items.length === 0) return { success: false, message: "Your cart is empty." };
    setBusy(true);
    try {
      const res = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId,
          cartId: cart.id,
          items: cart.items.map((item) => ({ productId: item.product, quantity: item.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return { success: true };
      }
      return { success: false, message: data.message || "Unable to check out." };
    } finally {
      setBusy(false);
    }
  }, [cart, shopId]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        busy,
        openCart: () => { setIsOpen(true); if (!cart) void fetchCart(); },
        closeCart: () => setIsOpen(false),
        addItem,
        updateItem,
        removeItem,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a CartProvider");
  return ctx;
}
