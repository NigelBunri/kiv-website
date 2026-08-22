"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductFields = {
  name: string;
  sku: string;
  description: string;
  price: string;
  sale_price: string;
  stock_qty: number;
  is_active: boolean;
  image_url: string;
};

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

export default function ProductEditForm({ shopId, productId, initial }: { shopId: string; productId: string; initial: ProductFields }) {
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      let mainImageMediaId: string | undefined;
      if (imageFile) {
        setProgress("Uploading image…");
        const initiate = await postJson(`/api/control/shops/${shopId}/uploads/initiate`, {
          purpose: "product_main_image",
          filename: imageFile.name,
          content_type: imageFile.type || "application/octet-stream",
          size_bytes: imageFile.size,
          product_id: productId,
        });
        const putRes = await fetch(initiate.uploadUrl, { method: "PUT", headers: initiate.headers, body: imageFile });
        if (!putRes.ok) throw new Error("Image upload to storage failed.");
        setProgress("Confirming…");
        const confirmed = await postJson(`/api/control/shops/${shopId}/uploads/${initiate.uploadId}/confirm`);
        mainImageMediaId = confirmed.mediaId || confirmed.upload_id;
      }

      const res = await fetch(`/api/control/shops/${shopId}/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          sku: fields.sku,
          description: fields.description,
          price: fields.price,
          sale_price: fields.sale_price || null,
          stock_qty: fields.stock_qty,
          is_active: fields.is_active,
          main_image_media_id: mainImageMediaId,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save changes.");
      setImageFile(null);
      if (data.data?.image_url) setFields((prev) => ({ ...prev, image_url: data.data.image_url }));
      setMessage({ kind: "success", text: "Changes saved." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save changes." });
    } finally {
      setSaving(false);
      setProgress("");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${fields.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/control/shops/${shopId}/products/${productId}`, { method: "DELETE" });
      if (res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        if (!data.success) throw new Error(data.message || "Unable to delete product.");
      }
      router.push(`/control/shops/${shopId}/products`);
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete product." });
      setDeleting(false);
    }
  }

  return (
    <section className="control-section">
      <form className="control-form" onSubmit={handleSave}>
        <label>Name<input value={fields.name} onChange={(e) => setFields({ ...fields, name: e.target.value })} required /></label>
        <label>SKU<input value={fields.sku} onChange={(e) => setFields({ ...fields, sku: e.target.value })} /></label>
        <label>Description<textarea rows={4} value={fields.description} onChange={(e) => setFields({ ...fields, description: e.target.value })} /></label>
        {fields.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fields.image_url} alt={fields.name} style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }} />
        ) : null}
        <label>Replace main image<input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></label>
        <label>Price<input type="number" min={0} step="0.01" value={fields.price} onChange={(e) => setFields({ ...fields, price: e.target.value })} required /></label>
        <label>Sale price (optional)<input type="number" min={0} step="0.01" value={fields.sale_price} onChange={(e) => setFields({ ...fields, sale_price: e.target.value })} /></label>
        <label>Stock quantity<input type="number" min={0} value={fields.stock_qty} onChange={(e) => setFields({ ...fields, stock_qty: Number(e.target.value) })} /></label>
        <label>
          <input type="checkbox" checked={fields.is_active} onChange={(e) => setFields({ ...fields, is_active: e.target.checked })} /> Active (visible in the marketplace)
        </label>
        <div className="control-actions">
          <button type="submit" className="button primary" disabled={saving}>{saving ? (progress || "Saving…") : "Save changes"}</button>
          <button type="button" className="button" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete product"}</button>
        </div>
      </form>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}
    </section>
  );
}
