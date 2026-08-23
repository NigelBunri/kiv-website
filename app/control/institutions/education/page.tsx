import Link from "next/link";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import EducationInstitutionCreateForm from "./EducationInstitutionCreateForm";

type EducationInstitution = {
  id: string;
  name: string;
  institution_type?: string;
};

export default async function EducationInstitutionsPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/`, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = res.ok ? await res.json() : { institutions: [] };
  const institutions: EducationInstitution[] = data.institutions || [];

  return (
    <>
      <div className="control-header">
        <h1>Education institutions</h1>
        <p>Schools, academies, and training centers you own or manage.</p>
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
              <td><Link href={`/control/institutions/education/${institution.id}`}>{institution.name}</Link></td>
              <td>{institution.institution_type || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {institutions.length === 0 ? <div className="control-empty">No education institutions yet.</div> : null}

      <EducationInstitutionCreateForm />
    </>
  );
}
