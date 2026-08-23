import Link from "next/link";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import HealthInstitutionCreateForm from "./HealthInstitutionCreateForm";

type HealthInstitution = {
  id: string;
  name: string;
  institution_type?: string;
  slug?: string;
};

export default async function HealthInstitutionsPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/health-ops/institutions/`, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = res.ok ? await res.json() : { results: [] };
  const institutions: HealthInstitution[] = data.results || [];

  return (
    <>
      <div className="control-header">
        <h1>Health institutions</h1>
        <p>Clinics, hospitals, labs, and other health institutions you own or manage.</p>
      </div>

      <table className="control-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {institutions.map((institution) => (
            <tr key={institution.id}>
              <td><Link href={`/control/institutions/health/${institution.id}`}>{institution.name}</Link></td>
              <td>{institution.institution_type || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {institutions.length === 0 ? <div className="control-empty">No health institutions yet.</div> : null}

      <HealthInstitutionCreateForm />
    </>
  );
}
