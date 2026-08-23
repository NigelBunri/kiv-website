import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ServiceCreateForm from "./ServiceCreateForm";

type Service = {
  id: string;
  name: string;
  service_type?: string;
  price: string | number;
  duration_minutes?: number;
  status: string;
};

type Category = { id: string; name: string };

export default async function ServicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { profile, session } = result;
  const headers = authHeaders(session);

  const [shopRes, servicesRes, categoriesRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/commerce/shops/${encodeURIComponent(id)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/commerce/shop-services/?shop=${encodeURIComponent(id)}`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/commerce/product-categories/?category_type=service`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!shopRes.ok) notFound();
  const shop = await shopRes.json();
  if (shop.owner !== profile.userId && !profile.isSuperuser) {
    // Same read-guard reasoning as the products list — Django's list
    // endpoint isn't owner-restricted, only writes are.
    const partnersRes = await fetch(`${kisApiBase()}/api/v1/partners/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const partnersData = partnersRes.ok ? await partnersRes.json() : {};
    const allPartners: { id: string; can_manage: boolean }[] = Array.isArray(partnersData?.results) ? partnersData.results : Array.isArray(partnersData) ? partnersData : [];
    const canView = Boolean(shop.partner_id) && allPartners.some((p) => p.can_manage && p.id === shop.partner_id);
    if (!canView) notFound();
  }
  const servicesData = servicesRes.ok ? await servicesRes.json() : {};
  const services: Service[] = Array.isArray(servicesData?.results) ? servicesData.results : Array.isArray(servicesData) ? servicesData : [];
  const categoriesData = categoriesRes.ok ? await categoriesRes.json() : {};
  const categories: Category[] = Array.isArray(categoriesData?.results) ? categoriesData.results : Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <>
      <div className="control-header">
        <h1>Services — {shop.name}</h1>
        <p>Create and manage bookable services for this shop.</p>
      </div>

      <ServiceCreateForm shopId={id} categories={categories} />

      <section className="control-section">
        <h2>All services</h2>
        {services.length === 0 ? (
          <div className="control-empty">No services yet. Create the first one above.</div>
        ) : (
          <div className="control-list">
            {services.map((s) => (
              <a key={s.id} href={`/control/shops/${id}/services/${s.id}`} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{s.name}</div>
                  <div className="control-list-row-meta">
                    {s.service_type ? `${s.service_type} · ` : ""}
                    {s.price}
                    {typeof s.duration_minutes === "number" ? ` · ${s.duration_minutes} min` : ""}
                  </div>
                </div>
                <span className={`control-badge control-badge--${s.status === "published" ? "active" : "inactive"}`}>{s.status}</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
