import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchHealthInstitutionDetail } from "@/lib/kistube-api";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

const TYPE_LABEL: Record<string, string> = {
  clinic: "Clinic", hospital: "Hospital", lab: "Laboratory",
  diagnostics: "Diagnostics Center", pharmacy: "Pharmacy", wellness_center: "Wellness Center",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const detail = await fetchHealthInstitutionDetail(id);
  if (!detail) return kistubeMetadata({ title: "Health institution", description: "KISTube health institution.", path: `/kistube/health/${id}`, robots: { index: false, follow: false } });
  return kistubeMetadata({
    title: detail.institution.name,
    description: `${detail.institution.name} — ${TYPE_LABEL[detail.institution.institution_type] || detail.institution.institution_type} on KISTube.`,
    path: `/kistube/health/${detail.institution.id}`,
    robots: kistubeRobots(false),
  });
}

export default async function KISTubeHealthInstitutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await fetchHealthInstitutionDetail(id);
  if (!detail) notFound();
  const { institution, services } = detail;

  return (
    <div>
      <h1 className="kt-page-heading" style={{ marginBottom: 0 }}>{institution.name}</h1>
      <p className="kt-page-subheading">{TYPE_LABEL[institution.institution_type] || institution.institution_type}</p>

      {services.length === 0 ? (
        <KISTubeEmptyState title="No services listed yet" body="This institution hasn't published any services yet." />
      ) : (
        <>
          <h2 className="kt-related-heading">Services</h2>
          <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {services.map((service) => (
              <div key={service.id} style={{ border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "1rem" }}>
                <h3 className="kt-card-title">{service.name}</h3>
                {service.description && <p style={{ fontSize: ".85rem", margin: ".3rem 0" }}>{service.description}</p>}
                <div className="kt-card-meta">
                  {service.base_cost_usd_label || (service.base_cost_micro <= 0 ? "Free" : `${(service.base_cost_micro / 1_000_000).toFixed(2)} USD`)}
                </div>
                {service.requires_assessment && <div className="kt-card-meta">Requires assessment</div>}
              </div>
            ))}
          </div>
          <p className="kt-page-subheading" style={{ marginTop: "1.5rem" }}>
            Open this institution in the KIS app to book an appointment or start a consultation.
          </p>
        </>
      )}
    </div>
  );
}
