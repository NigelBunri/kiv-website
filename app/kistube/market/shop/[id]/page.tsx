import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchShopProfile } from "@/lib/kistube-api";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchShopProfile(id);
  if (!profile) return kistubeMetadata({ title: "Shop", description: "KIS Market shop.", path: `/kistube/market/shop/${id}`, robots: { index: false, follow: false } });
  return kistubeMetadata({
    title: profile.shop.name,
    description: profile.shop.description || `${profile.shop.name} on KIS Market.`,
    path: `/kistube/market/shop/${profile.shop.id}`,
    image: profile.shop.image_url ? { url: profile.shop.image_url, width: 800, height: 800, alt: profile.shop.name } : undefined,
    robots: kistubeRobots(false),
  });
}

export default async function KISTubeShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await fetchShopProfile(id);
  if (!profile) notFound();
  const { shop, products, services } = profile;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        {shop.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shop.image_url} alt="" style={{ width: 72, height: 72, borderRadius: "999px", objectFit: "cover" }} />
        ) : (
          <span className="kt-channel-card-avatar" style={{ width: 72, height: 72 }} />
        )}
        <div>
          <h1 className="kt-page-heading" style={{ marginBottom: 0 }}>
            {shop.name}
            {shop.is_verified && <span className="kt-verified-badge">✓</span>}
          </h1>
          <p className="kt-card-meta">
            {shop.rating_avg ? `${shop.rating_avg.toFixed(1)}★ · ` : ""}
            {shop.followers_count} followers
          </p>
        </div>
      </div>

      {shop.description && <p className="kt-page-subheading" style={{ marginBottom: "1.5rem" }}>{shop.description}</p>}

      {products.length === 0 && services.length === 0 ? (
        <KISTubeEmptyState title="Nothing listed yet" body="This shop hasn't published any products or services yet." />
      ) : (
        <>
          {products.length > 0 && (
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 className="kt-related-heading">Products</h2>
              <div className="kt-grid">
                {products.map((product) => {
                  const hasSale = product.sale_price && product.sale_price !== product.price;
                  return (
                    <Link key={product.id} href={`/kistube/market/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={{ border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "1rem" }}>
                        <div className="kt-card-thumb-wrap">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt="" loading="lazy" />
                          ) : (
                            <div className="kt-card-thumb-placeholder">{product.name}</div>
                          )}
                        </div>
                        <h3 className="kt-card-title">{product.name}</h3>
                        <div className="kt-card-meta">
                          {hasSale ? product.sale_price : product.price} {product.currency}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {services.length > 0 && (
            <section>
              <h2 className="kt-related-heading">Services</h2>
              <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                {services.map((service) => (
                  <div key={service.id} style={{ border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "1rem" }}>
                    <h3 className="kt-card-title">{service.name}</h3>
                    {typeof service.base_cost_micro === "number" && (
                      <div className="kt-card-meta">{(service.base_cost_micro / 1_000_000).toFixed(2)}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
