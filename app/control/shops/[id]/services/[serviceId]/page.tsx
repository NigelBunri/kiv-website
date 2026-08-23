import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ServiceEditForm from "./ServiceEditForm";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string; serviceId: string }> }) {
  const { id, serviceId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const [serviceRes, categoriesRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/commerce/shop-services/${encodeURIComponent(serviceId)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/commerce/product-categories/?category_type=service`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  if (!serviceRes.ok) notFound();
  const service = await serviceRes.json();
  if (service.shop !== id) notFound();
  const categoriesData = categoriesRes.ok ? await categoriesRes.json() : {};
  const categories = Array.isArray(categoriesData?.results) ? categoriesData.results : Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <>
      <div className="control-header">
        <h1>{service.name}</h1>
        <p>Service</p>
      </div>
      <ServiceEditForm
        shopId={id}
        serviceId={service.id}
        categories={categories}
        initial={{
          name: service.name || "",
          category_ids: Array.isArray(service.catalog_categories) ? service.catalog_categories.map((c: { id: string }) => c.id) : [],
          short_summary: service.short_summary || "",
          description: service.description || "",
          service_type: service.service_type || "appointment",
          delivery_modes: Array.isArray(service.delivery_modes) ? service.delivery_modes : [],
          pricing_model: service.pricing_model || "fixed",
          price: String(service.price ?? ""),
          duration_minutes: service.duration_minutes ?? 60,
          remote_meeting_link: service.remote_meeting_link || "",
          visibility: service.visibility || "public",
          status: service.status || "draft",
        }}
      />
    </>
  );
}
