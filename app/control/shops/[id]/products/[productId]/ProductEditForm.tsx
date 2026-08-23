"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type GalleryImage = { id: string; image_url: string; sort_order: number };

type ProductFields = {
  name: string;
  sku: string;
  description: string;
  price: string;
  sale_price: string;
  stock_qty: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string;
  category_ids: string[];
  brand: string;
  condition: string;
  compare_at_price: string;
  available_sizes: string;
  available_colors: string;
  gallery_images: GalleryImage[];
};

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed.");
  return data.data;
}

export default function ProductEditForm({
  shopId,
  productId,
  categories,
  initial,
}: {
  shopId: string;
  productId: string;
  categories: Category[];
  initial: ProductFields;
}) {
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingImageId, setRemovingImageId] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function toggleCategory(id: string) {
    setFields((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id) ? prev.category_ids.filter((c) => c !== id) : [...prev.category_ids, id],
    }));
  }

  async function uploadAndConfirm(file: File, purpose: string): Promise<string> {
    const initiate = await postJson(`/api/control/shops/${shopId}/uploads/initiate`, {
      purpose,
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      product_id: productId,
    });
    const putRes = await fetch(initiate.uploadUrl, { method: "PUT", headers: initiate.headers, body: file });
    if (!putRes.ok) throw new Error("Image upload to storage failed.");
    const confirmed = await postJson(`/api/control/shops/${shopId}/uploads/${initiate.uploadId}/confirm`);
    return confirmed.mediaId || confirmed.upload_id;
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      let mainImageMediaId: string | undefined;
      if (imageFile) {
        setProgress("Uploading main image…");
        mainImageMediaId = await uploadAndConfirm(imageFile, "product_main_image");
      }
      const galleryMediaIds: string[] = [];
      for (let i = 0; i < galleryFiles.length; i++) {
        setProgress(`Uploading gallery image ${i + 1} of ${galleryFiles.length}…`);
        galleryMediaIds.push(await uploadAndConfirm(galleryFiles[i], "product_gallery_image"));
      }

      setProgress("Saving…");
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
          is_featured: fields.is_featured,
          catalog_category_ids: fields.category_ids,
          brand: fields.brand,
          condition: fields.condition,
          compare_at_price: fields.compare_at_price || null,
          available_sizes: fields.available_sizes ? fields.available_sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
          available_colors: fields.available_colors ? fields.available_colors.split(",").map((s) => s.trim()).filter(Boolean) : [],
          main_image_media_id: mainImageMediaId,
          gallery_media_ids: galleryMediaIds,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save changes.");
      setImageFile(null);
      setGalleryFiles([]);
      if (data.data?.image_url) setFields((prev) => ({ ...prev, image_url: data.data.image_url }));
      if (Array.isArray(data.data?.gallery_images)) setFields((prev) => ({ ...prev, gallery_images: data.data.gallery_images }));
      setMessage({ kind: "success", text: "Changes saved." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save changes." });
    } finally {
      setSaving(false);
      setProgress("");
    }
  }

  async function removeGalleryImage(imageId: string) {
    setRemovingImageId(imageId);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/shops/${shopId}/products/${productId}/gallery/${imageId}`, { method: "DELETE" });
      if (res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        if (!data.success) throw new Error(data.message || "Unable to remove image.");
      }
      setFields((prev) => ({ ...prev, gallery_images: prev.gallery_images.filter((g) => g.id !== imageId) }));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to remove image." });
    } finally {
      setRemovingImageId(null);
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
        {categories.length > 0 ? (
          <fieldset>
            <legend>Categories</legend>
            {categories.map((c) => (
              <label key={c.id} style={{ display: "block" }}>
                <input type="checkbox" checked={fields.category_ids.includes(c.id)} onChange={() => toggleCategory(c.id)} /> {c.name}
              </label>
            ))}
          </fieldset>
        ) : null}
        {fields.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fields.image_url} alt={fields.name} style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }} />
        ) : null}
        <label>Replace main image<input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></label>

        {fields.gallery_images.length > 0 ? (
          <div>
            <p>Gallery images</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {fields.gallery_images.map((img) => (
                <div key={img.id} style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url} alt="Gallery" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px" }} />
                  <button type="button" className="button" onClick={() => removeGalleryImage(img.id)} disabled={removingImageId === img.id} style={{ display: "block", width: "100%" }}>
                    {removingImageId === img.id ? "…" : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <label>Add gallery images<input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))} /></label>

        <label>Price<input type="number" min={0} step="0.01" value={fields.price} onChange={(e) => setFields({ ...fields, price: e.target.value })} required /></label>
        <label>Sale price (optional)<input type="number" min={0} step="0.01" value={fields.sale_price} onChange={(e) => setFields({ ...fields, sale_price: e.target.value })} /></label>
        <label>Compare-at price (optional)<input type="number" min={0} step="0.01" value={fields.compare_at_price} onChange={(e) => setFields({ ...fields, compare_at_price: e.target.value })} /></label>
        <label>Stock quantity<input type="number" min={0} value={fields.stock_qty} onChange={(e) => setFields({ ...fields, stock_qty: Number(e.target.value) })} /></label>
        <label>Brand<input value={fields.brand} onChange={(e) => setFields({ ...fields, brand: e.target.value })} /></label>
        <label>Condition<input value={fields.condition} onChange={(e) => setFields({ ...fields, condition: e.target.value })} placeholder="New, used, refurbished…" /></label>
        <label>Available sizes (comma-separated)<input value={fields.available_sizes} onChange={(e) => setFields({ ...fields, available_sizes: e.target.value })} placeholder="S, M, L, XL" /></label>
        <label>Available colors (comma-separated)<input value={fields.available_colors} onChange={(e) => setFields({ ...fields, available_colors: e.target.value })} placeholder="Black, White, Red" /></label>
        <label>
          <input type="checkbox" checked={fields.is_active} onChange={(e) => setFields({ ...fields, is_active: e.target.checked })} /> Active (visible in the marketplace)
        </label>
        <label>
          <input type="checkbox" checked={fields.is_featured} onChange={(e) => setFields({ ...fields, is_featured: e.target.checked })} /> Featured
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
