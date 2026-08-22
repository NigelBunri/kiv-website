import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ProductEditForm from "./ProductEditForm";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string; productId: string }> }) {
  const { id, productId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/commerce/products/${encodeURIComponent(productId)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!res.ok) notFound();
  const product = await res.json();
  if (product.shop !== id) notFound();

  return (
    <>
      <div className="control-header">
        <h1>{product.name}</h1>
        <p>Product</p>
      </div>
      <ProductEditForm
        shopId={id}
        productId={product.id}
        initial={{
          name: product.name || "",
          sku: product.sku || "",
          description: product.description || "",
          price: String(product.price ?? ""),
          sale_price: product.sale_price != null ? String(product.sale_price) : "",
          stock_qty: product.stock_qty ?? 0,
          is_active: Boolean(product.is_active),
        }}
      />
    </>
  );
}
