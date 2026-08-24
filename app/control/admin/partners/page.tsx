import Link from "next/link";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";

type AdminPartner = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  owner: { id: string; email: string | null; username: string | null } | null;
};

export default async function AdminPartnersPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/control/admin/partners/`, { headers, cache: "no-store", signal: AbortSignal.timeout(20_000) });
  const data = res.ok ? await res.json() : { partners: [], pagination: null };
  const partners: AdminPartner[] = data.partners || [];

  return (
    <>
      <div className="control-header">
        <h1>Partners</h1>
        <p>{data.pagination ? `${data.pagination.total_items} total` : ""}</p>
      </div>

      <table className="control-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Owner</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr key={partner.id}>
              <td><Link href={`/control/admin/partners/${partner.id}`}>{partner.name}</Link></td>
              <td>{partner.owner?.email || partner.owner?.username || "-"}</td>
              <td>
                <span className={`control-badge ${partner.is_active ? "control-badge--active" : "control-badge--inactive"}`}>
                  {partner.is_active ? "Active" : "Deactivated"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {partners.length === 0 ? <div className="control-empty">No partners found.</div> : null}
    </>
  );
}
