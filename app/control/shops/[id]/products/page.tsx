import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ProductCreateForm from "./ProductCreateForm";
import { BackLink } from "@/app/control/BackLink";

type Product = {
  id: string;
  name: string;
  sku?: string;
  price: string | number;
  sale_price?: string | number | null;
  stock_qty?: number;
  is_active: boolean;
  image_url?: string;
};

export default async function ProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { profile, session } = result;
  const headers = authHeaders(session);

  const [shopRes, productsRes, categoriesRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/commerce/shops/${encodeURIComponent(id)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/commerce/products/?shop=${encodeURIComponent(id)}`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/commerce/product-categories/?category_type=product`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!shopRes.ok) notFound();
  const shop = await shopRes.json();
  if (shop.owner !== profile.userId && !profile.isSuperuser) {
    // Same read-guard reasoning as the shop detail page - Django's list
    // endpoint isn't owner-restricted, only writes are.
    const partnersRes = await fetch(`${kisApiBase()}/api/v1/partners/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const partnersData = partnersRes.ok ? await partnersRes.json() : {};
    const allPartners: { id: string; can_manage: boolean }[] = Array.isArray(partnersData?.results) ? partnersData.results : Array.isArray(partnersData) ? partnersData : [];
    const canView = Boolean(shop.partner_id) && allPartners.some((p) => p.can_manage && p.id === shop.partner_id);
    if (!canView) notFound();
  }
  const productsData = productsRes.ok ? await productsRes.json() : {};
  const products: Product[] = Array.isArray(productsData?.results) ? productsData.results : Array.isArray(productsData) ? productsData : [];
  const categoriesData = categoriesRes.ok ? await categoriesRes.json() : {};
  const categories = Array.isArray(categoriesData?.results) ? categoriesData.results : Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <>
      <BackLink href={`/control/shops/${id}`} label="Back to shop" />
      <div className="control-header">
        <h1>Products - {shop.name}</h1>
        <p>Create and manage this shop&rsquo;s marketplace listings.</p>
      </div>

      <ProductCreateForm shopId={id} categories={categories} />

      <section className="control-section">
        <h2>All products</h2>
        {products.length === 0 ? (
          <div className="control-empty">No products yet. Create the first one above.</div>
        ) : (
          <div className="control-list">
            {products.map((p) => (
              <a key={p.id} href={`/control/shops/${id}/products/${p.id}`} className="control-list-row">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px" }} />
                ) : null}
                <div>
                  <div className="control-list-row-title">{p.name}</div>
                  <div className="control-list-row-meta">
                    {p.sku ? `${p.sku} · ` : ""}
                    {p.sale_price ? `${p.sale_price} (was ${p.price})` : p.price}
                    {typeof p.stock_qty === "number" ? ` · ${p.stock_qty} in stock` : ""}
                  </div>
                </div>
                <span className={`control-badge control-badge--${p.is_active ? "active" : "inactive"}`}>{p.is_active ? "active" : "inactive"}</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
