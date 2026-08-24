"use client";

import { useState } from "react";

type Order = {
  id: string;
  status: string;
  total_usd_label?: string;
  buyer_info?: { name?: string; display_name?: string } | null;
  items?: { product_name?: string; quantity?: number }[];
  created_at?: string;
};

export default function OrdersList({ shopId, initialOrders }: { shopId: string; initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function markComplete(orderId: string) {
    setCompletingId(orderId);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/shops/${shopId}/orders/${orderId}/complete`, { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to mark this order complete.");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: data.data?.status || "completed" } : o)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to mark this order complete." });
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <section className="control-section">
      {message ? <p className="control-error">{message.text}</p> : null}
      {orders.length === 0 ? (
        <div className="control-empty">No orders yet.</div>
      ) : (
        <div className="control-list">
          {orders.map((order) => (
            <div key={order.id} className="control-list-row">
              <div>
                <div className="control-list-row-title">
                  {order.buyer_info?.display_name || order.buyer_info?.name || "Buyer"} - {order.total_usd_label || ""}
                </div>
                <div className="control-list-row-meta">
                  {(order.items || []).map((item) => `${item.product_name || "Item"} ×${item.quantity || 1}`).join(", ")}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className={`control-badge control-badge--${order.status === "completed" ? "active" : "pending"}`}>{order.status}</span>
                {order.status !== "completed" ? (
                  <button type="button" className="button" onClick={() => markComplete(order.id)} disabled={completingId === order.id}>
                    {completingId === order.id ? "Marking…" : "Mark completed"}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
