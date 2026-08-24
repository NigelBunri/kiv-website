import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import AvailabilityWorkspace from "./AvailabilityWorkspace";
import { BackLink } from "@/app/control/BackLink";

export default async function HealthAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
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

  // The health-dashboard availability endpoint only recognizes
  // institutions that already have a row in the legacy broadcast-profile
  // blob (same reconciliation gap as StaffWorkspace.tsx) - and unlike the
  // staff page, it has no create-on-write fallback, so this eagerly
  // creates the matching blob entry server-side before the availability
  // call, instead of waiting for the user to visit "Manage staff" first.
  const blobRes = await fetch(`${kisApiBase()}/api/v1/broadcasts/profiles/create/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const blobData = blobRes.ok ? await blobRes.json() : {};
  const allInstitutions: { id: string }[] = Array.isArray(blobData?.profiles?.health?.institutions) ? blobData.profiles.health.institutions : [];
  const alreadyLinked = allInstitutions.some((entry) => String(entry.id) === String(id));
  if (!alreadyLinked) {
    const stub = {
      id: institution.id,
      name: institution.name,
      type: institution.institution_type,
      owner_contact: { userId: profile.userId, name: profile.displayName, phone: "", email: "" },
      members: [],
      membership_settings: { open: false, discountPercent: 10 },
    };
    await fetch(`${kisApiBase()}/api/v1/broadcasts/profiles/manage/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
      body: JSON.stringify({ profile_type: "health_profile", updates: { institutions: [...allInstitutions, stub] } }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null);
  }

  const [availabilityRes, servicesRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/health-dashboard/institutions/${encodeURIComponent(id)}/availability/`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    }),
    fetch(`${kisApiBase()}/api/v1/health-ops/institutions/${encodeURIComponent(id)}/services/`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
    }),
  ]);
  const availabilityData = availabilityRes.ok ? await availabilityRes.json() : {};
  const availability = availabilityData?.availability || {
    calendar_statuses: {}, calendar_times: {}, calendar_service_ids: {}, blocked_times: [], service_availability: {},
  };
  const servicesData = servicesRes.ok ? await servicesRes.json() : {};
  const services: { id: string; name: string }[] = Array.isArray(servicesData?.results) ? servicesData.results : [];

  return (
    <>
      <BackLink href={`/control/institutions/health/${id}`} label="Back to institution" />
      <div className="control-header">
        <h1>Availability - {institution.name}</h1>
        <p>Set day-by-day booking status, time slots, and per-service scheduling.</p>
      </div>
      <AvailabilityWorkspace institutionId={institution.id} services={services} initialAvailability={availability} />
    </>
  );
}
