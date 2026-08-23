import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ProductEditForm from "./ProductEditForm";
import { BackLink } from "@/app/control/BackLink";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string; productId: string }> }) {
  const { id, productId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const [productRes, categoriesRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/commerce/products/${encodeURIComponent(productId)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/commerce/product-categories/?category_type=product`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!productRes.ok) notFound();
  const product = await productRes.json();
  if (product.shop !== id) notFound();
  const categoriesData = categoriesRes.ok ? await categoriesRes.json() : {};
  const categories = Array.isArray(categoriesData?.results) ? categoriesData.results : Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <>
      <BackLink href={`/control/shops/${id}/products`} label="Back to products" />
      <div className="control-header">
        <h1>{product.name}</h1>
        <p>Product</p>
      </div>
      <ProductEditForm
        shopId={id}
        productId={product.id}
        categories={categories}
        initial={{
          name: product.name || "",
          sku: product.sku || "",
          description: product.description || "",
          price: String(product.price ?? ""),
          sale_price: product.sale_price != null ? String(product.sale_price) : "",
          stock_qty: product.stock_qty ?? 0,
          is_active: Boolean(product.is_active),
          is_featured: Boolean(product.is_featured),
          image_url: product.image_url || "",
          category_ids: Array.isArray(product.catalog_categories) ? product.catalog_categories.map((c: { id: string }) => c.id) : [],
          brand: product.brand || "",
          condition: product.condition || "",
          compare_at_price: product.compare_at_price != null ? String(product.compare_at_price) : "",
          available_sizes: Array.isArray(product.available_sizes) ? product.available_sizes.join(", ") : "",
          available_colors: Array.isArray(product.available_colors) ? product.available_colors.join(", ") : "",
          gallery_images: Array.isArray(product.gallery_images) ? product.gallery_images : [],
        }}
      />
    </>
  );
}
