import Link from "next/link";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";

type AdminUser = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  tier: string;
  status: string;
  is_staff: boolean;
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  const res = await fetch(`${kisApiBase()}/control/admin/users/${query}`, { headers, cache: "no-store", signal: AbortSignal.timeout(20_000) });
  const data = res.ok ? await res.json() : { users: [], pagination: null };
  const users: AdminUser[] = data.users || [];

  return (
    <>
      <div className="control-header">
        <h1>Users</h1>
        <p>{data.pagination ? `${data.pagination.total_items} total` : ""}</p>
      </div>

      <form method="GET" className="control-actions" style={{ marginBottom: "1rem" }}>
        <input type="search" name="q" defaultValue={q || ""} placeholder="Search by name, email, phone…" />
        <button type="submit" className="button secondary">Search</button>
      </form>

      <table className="control-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Tier</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td><Link href={`/control/admin/users/${user.id}`}>{user.display_name || user.username}</Link></td>
              <td>{user.email}</td>
              <td>{user.tier}</td>
              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 ? <div className="control-empty">No users found.</div> : null}
    </>
  );
}
