import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProductDetail, fetchShopProfile } from "@/lib/kistube-api";
import { AddToCartButton } from "@/components/kistube/AddToCartButton";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductDetail(id);
  if (!product) return kistubeMetadata({ title: "Product", description: "KIS Market product.", path: `/kistube/market/product/${id}`, robots: { index: false, follow: false } });
  return kistubeMetadata({
    title: product.name,
    description: product.description || `${product.name} on KIS Market.`,
    path: `/kistube/market/product/${product.id}`,
    type: "article",
    image: product.image_url ? { url: product.image_url, width: 1200, height: 1200, alt: product.name } : undefined,
    robots: kistubeRobots(false),
  });
}

export default async function KISTubeProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, { viewer }] = await Promise.all([fetchProductDetail(id), getKisTubeSidebarData()]);
  if (!product) notFound();
  // product.shop is a bare shop id (see MarketProduct's `shop: string` type
  // comment) - fetch the shop separately for its name/link.
  const shopProfile = await fetchShopProfile(product.shop);

  const hasSale = product.sale_price && product.sale_price !== product.price;
  const stockStatus = product.fulfillment_summary?.stock_status;
  const outOfStock = stockStatus === "out_of_stock" || (typeof product.stock_qty === "number" && product.stock_qty <= 0 && !product.variants?.length);
  const gallery = [product.image_url, ...(product.gallery_images?.map((g) => g.image_url) ?? [])].filter(Boolean) as string[];

  return (
    <div className="kt-watch-layout">
      <div>
        <div className="kt-player-wrap" style={{ background: "var(--cream-2)" }}>
          {gallery[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gallery[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#fff" }}>No image available</div>
          )}
        </div>

        {gallery.length > 1 && (
          <div style={{ display: "flex", gap: ".5rem", marginTop: ".6rem", overflowX: "auto" }}>
            {gallery.slice(1).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--line-soft)" }} />
            ))}
          </div>
        )}

        <h1 className="kt-watch-title">{product.name}</h1>

        <div className="kt-card-meta" style={{ fontSize: "1.1rem", marginBottom: ".5rem" }}>
          {hasSale ? product.sale_price : product.price} {product.currency}
          {hasSale && (
            <span style={{ textDecoration: "line-through", marginLeft: ".6rem", opacity: 0.6 }}>
              {product.price} {product.currency}
            </span>
          )}
        </div>

        <Link href={`/kistube/market/shop/${product.shop}`} className="kt-watch-channel-info" style={{ textDecoration: "none", color: "inherit", display: "inline-block", marginBottom: "1rem" }}>
          {shopProfile?.shop.name || "View shop"}
        </Link>

        {outOfStock ? (
          <p style={{ color: "var(--danger)", fontWeight: 700, marginBottom: "1rem" }}>Out of stock</p>
        ) : (
          <div style={{ marginBottom: "1.5rem" }}>
            <AddToCartButton productId={product.id} shopId={product.shop} signedIn={viewer.signedIn} />
          </div>
        )}

        {product.description && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 className="kt-related-heading">Description</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{product.description}</p>
          </div>
        )}

        {product.fulfillment_summary?.delivery_estimate && (
          <p className="kt-card-meta">Delivery: {product.fulfillment_summary.delivery_estimate}</p>
        )}
      </div>
    </div>
  );
}
