import Link from "next/link";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ShopCreateForm from "./ShopCreateForm";

type Shop = {
  id: string;
  name: string;
  status?: string;
};

export default async function ShopsPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { profile, session } = result;
  const headers = authHeaders(session);

  // ShopViewSet.list() defaults to "active shops OR mine" for a signed-in
  // non-staff user — ?owner scopes this page to "my shops" specifically,
  // matching the Health/Education institution pages' owner-only listing.
  const res = await fetch(`${kisApiBase()}/api/v1/commerce/shops/?owner=${encodeURIComponent(profile.userId)}`, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = res.ok ? await res.json() : { results: [] };
  const shops: Shop[] = data.results || (Array.isArray(data) ? data : []);

  return (
    <>
      <div className="control-header">
        <h1>Market shops</h1>
        <p>Shops you own on the marketplace.</p>
      </div>

      <table className="control-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {shops.map((shop) => (
            <tr key={shop.id}>
              <td><Link href={`/control/shops/${shop.id}`}>{shop.name}</Link></td>
              <td>{shop.status || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {shops.length === 0 ? <div className="control-empty">No shops yet.</div> : null}

      <ShopCreateForm />
    </>
  );
}
