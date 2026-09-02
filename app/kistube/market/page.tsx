import type { Metadata } from "next";
import Link from "next/link";
import { fetchMarketDiscovery } from "@/lib/kistube-api";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { formatCount } from "@/lib/kistube-format";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Market",
  description: "Trending products, trusted shops and spotlighted services from the KIS Market.",
  path: "/kistube/market",
  robots: kistubeRobots(),
});

// No dedicated product-card CSS class exists yet - this mirrors
// .kt-channel-card's bordered/rounded look inline rather than inventing a
// new global class, per the KISTube visual language.
const tileStyle = {
  border: "1px solid var(--line-soft)",
  borderRadius: "var(--radius-md)",
  background: "var(--surface)",
  padding: "1rem",
};

export default async function KISTubeMarketPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const discovery = await fetchMarketDiscovery(q);

  const products = discovery?.sections?.featured_products?.length
    ? discovery.sections.featured_products
    : discovery?.trending_products ?? [];
  const shops = discovery?.sections?.trusted_shops?.length
    ? discovery.sections.trusted_shops
    : discovery?.popular_shops ?? [];
  const services = discovery?.sections?.service_spotlight ?? [];

  const isEmpty = products.length === 0 && shops.length === 0 && services.length === 0;

  return (
    <div>
      <h1 className="kt-page-heading">Market</h1>
      <p className="kt-page-subheading">Trending products, trusted shops and spotlighted services from the KIS Market.</p>

      <form className="kt-search-form" style={{ maxWidth: 420, marginBottom: "1.25rem" }} role="search">
        <input type="search" name="q" defaultValue={q} placeholder="Search the Market" aria-label="Search the Market" />
        <button type="submit">Search</button>
      </form>

      {isEmpty ? (
        <KISTubeEmptyState
          title="Nothing to show yet"
          body="Try a different search, or check back soon as shops add products and services."
        />
      ) : (
        <>
          {products.length > 0 && (
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 className="kt-related-heading">Trending products</h2>
              <div className="kt-grid">
                {products.map((product) => {
                  const hasSale = product.sale_price && product.sale_price !== product.price;
                  return (
                    <Link key={product.id} href={`/kistube/market/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={tileStyle}>
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
                          {hasSale && (
                            <span style={{ textDecoration: "line-through", marginLeft: ".4rem", opacity: 0.6 }}>
                              {product.price} {product.currency}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {shops.length > 0 && (
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 className="kt-related-heading">Trusted shops</h2>
              <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {shops.map((shop) => (
                  <Link key={shop.id} href={`/kistube/market/shop/${shop.id}`} className="kt-channel-card" style={{ textDecoration: "none", color: "inherit" }}>
                    {shop.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={shop.image_url} alt="" className="kt-channel-card-avatar" />
                    ) : (
                      <span className="kt-channel-card-avatar" />
                    )}
                    <span className="kt-channel-card-name">
                      {shop.name}
                      {shop.is_verified && <span className="kt-verified-badge">✓</span>}
                    </span>
                    <span className="kt-channel-card-meta">
                      {shop.rating_avg ? `${shop.rating_avg.toFixed(1)}★ · ` : ""}
                      {formatCount(shop.followers_count)} followers
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {services.length > 0 && (
            <section>
              <h2 className="kt-related-heading">Services</h2>
              <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                {services.map((service) => (
                  // No dedicated service detail page yet (see docs/kistube.md's
                  // "intentionally out of scope") - links to the provider's
                  // shop page instead of a broken/missing destination.
                  <Link key={service.id} href={`/kistube/market/shop/${service.shop}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={tileStyle}>
                      <h3 className="kt-card-title">{service.name}</h3>
                      {typeof service.base_cost_micro === "number" && (
                        <div className="kt-card-meta">
                          {(service.base_cost_micro / 1_000_000).toFixed(2)} {discovery?.currency}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
