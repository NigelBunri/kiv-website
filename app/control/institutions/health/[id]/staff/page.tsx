import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import StaffWorkspace from "./StaffWorkspace";
import { BackLink } from "@/app/control/BackLink";

type BlobMember = {
  id: string;
  userId?: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
};

type BlobInstitution = {
  id: string;
  name?: string;
  type?: string;
  owner_contact?: { userId?: string; name?: string; phone?: string; email?: string };
  members?: BlobMember[];
  membership_settings?: { open?: boolean; discountPercent?: number };
};

export default async function HealthStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { profile, session } = result;
  const headers = authHeaders(session);

  const institutionRes = await fetch(`${kisApiBase()}/api/v1/health-ops/institutions/${encodeURIComponent(id)}/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  if (!institutionRes.ok) notFound();
  const institutionData = await institutionRes.json();
  const institution = institutionData?.institution || institutionData;
  if (!institution.can_manage) notFound();

  const blobRes = await fetch(`${kisApiBase()}/api/v1/broadcasts/profiles/create/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const blobData = blobRes.ok ? await blobRes.json() : {};
  const allInstitutions: BlobInstitution[] = Array.isArray(blobData?.profiles?.health?.institutions) ? blobData.profiles.health.institutions : [];
  const existing = allInstitutions.find((entry) => String(entry.id) === String(id));

  // If this health_ops institution has never been touched through the
  // legacy broadcast-profile blob (e.g. it was created entirely through
  // this website), there's no matching entry yet - StaffWorkspace starts
  // from a fresh stub using the same id, and the backend creates the
  // matching blob row on first save (its institutions[] merge already
  // supports create-on-write for unrecognized ids).
  const initialTarget: BlobInstitution = existing || {
    id: institution.id,
    name: institution.name,
    type: institution.institution_type,
    owner_contact: { userId: profile.userId, name: profile.displayName, phone: "", email: "" },
    members: [],
    membership_settings: { open: false, discountPercent: 10 },
  };
  const otherInstitutions = allInstitutions.filter((entry) => String(entry.id) !== String(id));

  return (
    <>
      <BackLink href={`/control/institutions/health/${id}`} label="Back to institution" />
      <div className="control-header">
        <h1>Staff - {institution.name}</h1>
        <p>Add, remove, and assign roles for this institution&rsquo;s staff.</p>
      </div>
      <StaffWorkspace
        institutionId={institution.id}
        initialTarget={initialTarget}
        otherInstitutions={otherInstitutions}
      />
    </>
  );
}
