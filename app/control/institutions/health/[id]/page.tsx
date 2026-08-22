import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import PartnerConnectPanel from "../../../PartnerConnectPanel";

type Institution = {
  id: string;
  name: string;
  institution_type: string;
  partner_id?: string | null;
  partner_name?: string | null;
};

type Partner = { id: string; name: string; can_manage: boolean };

export default async function HealthInstitutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const [institutionRes, partnersRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/health-ops/institutions/${encodeURIComponent(id)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/partners/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  // _resolve_institution_for_request/_accessible_institutions_for_user
  // already scope this to owner-or-member-or-partner-accessible
  // institutions server-side, same as the education institution page.
  if (!institutionRes.ok) notFound();
  const institutionData = await institutionRes.json();
  const institution: Institution = institutionData?.institution || institutionData;
  const partnersData = partnersRes.ok ? await partnersRes.json() : {};
  const allPartners: Partner[] = Array.isArray(partnersData?.results) ? partnersData.results : Array.isArray(partnersData) ? partnersData : [];
  const manageablePartners = allPartners.filter((partner) => partner.can_manage);

  return (
    <>
      <div className="control-header">
        <h1>{institution.name}</h1>
        <p>Health institution — {institution.institution_type}</p>
      </div>
      <section className="control-section">
        <h2>Institution details</h2>
        <p className="control-note">
          Editing name/type from the control panel isn&rsquo;t available yet — use the KIS app for
          now. Connecting a partner organization works here.
        </p>
      </section>
      <PartnerConnectPanel
        partnerApiPath={`/api/control/institutions/health/${institution.id}/partner`}
        initialPartnerId={institution.partner_id || null}
        initialPartnerName={institution.partner_name || null}
        manageablePartners={manageablePartners}
      />
    </>
  );
}
