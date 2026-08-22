"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductCreateForm({ shopId }: { shopId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [inventoryType, setInventoryType] = useState("physical");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/shops/${shopId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku,
          description,
          price,
          inventory_type: inventoryType,
          stock_qty: stockQty ? Number(stockQty) : 0,
          is_active: true,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create product.");
      const newId = data.data?.id;
      setName(""); setSku(""); setDescription(""); setPrice(""); setStockQty("");
      setMessage({ kind: "success", text: "Product created." });
      router.refresh();
      if (newId) router.push(`/control/shops/${shopId}/products/${newId}`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to create product." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="control-section">
      <h2>New product</h2>
      <form className="control-form" onSubmit={handleCreate}>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>SKU<input value={sku} onChange={(e) => setSku(e.target.value)} /></label>
        <label>Description<textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label>Price<input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required /></label>
        <label>
          Type
          <select value={inventoryType} onChange={(e) => setInventoryType(e.target.value)}>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
            <option value="service">Service</option>
          </select>
        </label>
        {inventoryType === "physical" ? (
          <label>Stock quantity<input type="number" min={0} value={stockQty} onChange={(e) => setStockQty(e.target.value)} /></label>
        ) : null}
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={creating || !name.trim() || !price}>
            {creating ? "Creating…" : "Create product"}
          </button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
