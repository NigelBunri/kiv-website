import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import StaffWorkspace from "./StaffWorkspace";
import { BackLink } from "@/app/control/BackLink";

type Membership = {
  id: string;
  user_id: string;
  display_name?: string;
  phone?: string;
  email?: string;
  role: string;
  status: string;
  title?: string;
};

export default async function EducationStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/memberships/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) notFound();
  const data = await res.json();
  const memberships: Membership[] = Array.isArray(data?.memberships) ? data.memberships : [];

  return (
    <>
      <BackLink href={`/control/institutions/education/${id}`} label="Back to institution" />
      <div className="control-header">
        <h1>Staff</h1>
        <p>Add staff, assign roles, and approve join requests.</p>
      </div>
      <StaffWorkspace institutionId={id} initialMemberships={memberships} />
    </>
  );
}
