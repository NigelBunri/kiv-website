import type { Metadata } from "next";
import Link from "next/link";
import { fetchHealthDiscovery } from "@/lib/kistube-api";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Health",
  description: "Browse health institutions on KISTube — clinics, hospitals, labs, diagnostics centers, pharmacies and wellness centers that have opted into public visibility.",
  path: "/kistube/health",
  robots: kistubeRobots(),
});

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "clinic", label: "Clinics" },
  { value: "hospital", label: "Hospitals" },
  { value: "lab", label: "Labs" },
  { value: "diagnostics", label: "Diagnostics" },
  { value: "pharmacy", label: "Pharmacies" },
  { value: "wellness_center", label: "Wellness" },
] as const;

const TYPE_LABEL: Record<string, string> = {
  clinic: "Clinic", hospital: "Hospital", lab: "Laboratory",
  diagnostics: "Diagnostics Center", pharmacy: "Pharmacy", wellness_center: "Wellness Center",
};

export default async function KISTubeHealthPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;
  const discovery = await fetchHealthDiscovery({ q, type, limit: 48 });

  return (
    <div>
      <h1 className="kt-page-heading">Health</h1>
      <p className="kt-page-subheading">Health institutions on KISTube that have opted into public visibility — clinics, hospitals, labs, diagnostics centers, pharmacies and wellness centers.</p>

      <form className="kt-search-form" style={{ maxWidth: 420, marginBottom: "1.25rem" }} role="search">
        <input type="search" name="q" defaultValue={q} placeholder="Search health institutions" aria-label="Search health institutions" />
        {type && <input type="hidden" name="type" value={type} />}
        <button type="submit">Search</button>
      </form>

      <div className="kt-filter-row">
        {TYPE_FILTERS.map((filter) => (
          <Link
            key={filter.value || "all"}
            href={`/kistube/health${filter.value ? `?type=${filter.value}` : ""}`}
            className={`kt-filter-chip${(type || "") === filter.value ? " is-active" : ""}`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {!discovery || discovery.results.length === 0 ? (
        <KISTubeEmptyState
          title="No public health institutions yet"
          body="Institution owners can opt into public visibility from their institution settings. Check back soon, or search for a different type."
        />
      ) : (
        <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {discovery.results.map((institution) => (
            <div key={institution.id} className="kt-channel-card">
              <span className="kt-channel-card-avatar" />
              <span className="kt-channel-card-name">{institution.name}</span>
              <span className="kt-channel-card-meta">{TYPE_LABEL[institution.institution_type] || institution.institution_type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
