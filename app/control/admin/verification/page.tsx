import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import VerificationQueueList, { type StaffCase } from "./VerificationQueueList";

export default async function AdminVerificationPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/verification/staff/cases/?subject_type=partner`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(20_000),
  });
  const data = res.ok ? await res.json() : {};
  const cases: StaffCase[] = Array.isArray(data?.results) ? data.results : [];

  return (
    <>
      <div className="control-header">
        <h1>Verification queue</h1>
        <p>Pending partner verification requests.</p>
      </div>
      <VerificationQueueList initialCases={cases} />
    </>
  );
}
