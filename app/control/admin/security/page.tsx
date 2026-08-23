import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import SecurityFlagsList from "./SecurityFlagsList";

type Flag = {
  id: string;
  actor?: string | null;
  reason: string;
  path?: string;
  severity: string;
  resolved: boolean;
  created_at: string;
};

export default async function AdminSecurityPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/control/admin/activity/flags/?resolved=false`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(20_000),
  });
  const flags: Flag[] = res.ok ? await res.json() : [];

  return (
    <>
      <div className="control-header">
        <h1>Suspicious activity</h1>
        <p>Unresolved flags from platform monitoring.</p>
      </div>
      <SecurityFlagsList initialFlags={Array.isArray(flags) ? flags : []} />
    </>
  );
}
