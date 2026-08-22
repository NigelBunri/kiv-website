import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import EducationInstitutionEditForm from "./EducationInstitutionEditForm";
import PartnerConnectPanel from "../../../PartnerConnectPanel";

type Institution = {
  id: string;
  name: string;
  description: string;
  owner: string;
  partner_id?: string | null;
  partner_name?: string | null;
};

type Partner = { id: string; name: string; can_manage: boolean };

export default async function EducationInstitutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { profile, session } = result;
  const headers = authHeaders(session);

  const [institutionRes, partnersRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/partners/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  // _get_education_institution_or_404 already scopes this to owner-or-
  // member-or-partner-accessible institutions server-side (this session's
  // earlier work), so a non-404 response here already means the caller is
  // allowed to at least view it — no extra client-side ownership check
  // needed, unlike the Shop page.
  if (!institutionRes.ok) notFound();
  const institutionData = await institutionRes.json();
  const institution: Institution = institutionData?.institution || institutionData;
  const partnersData = partnersRes.ok ? await partnersRes.json() : {};
  const allPartners: Partner[] = Array.isArray(partnersData?.results) ? partnersData.results : Array.isArray(partnersData) ? partnersData : [];
  const manageablePartners = allPartners.filter((partner) => partner.can_manage);
  const canEdit = institution.owner === profile.userId || profile.isSuperuser || (Boolean(institution.partner_id) && manageablePartners.some((partner) => partner.id === institution.partner_id));

  return (
    <>
      <div className="control-header">
        <h1>{institution.name}</h1>
        <p>Education institution</p>
      </div>
      {canEdit ? (
        <EducationInstitutionEditForm institutionId={institution.id} initialName={institution.name} initialDescription={institution.description || ""} />
      ) : null}
      <PartnerConnectPanel
        partnerApiPath={`/api/control/institutions/education/${institution.id}/partner`}
        initialPartnerId={institution.partner_id || null}
        initialPartnerName={institution.partner_name || null}
        manageablePartners={manageablePartners}
      />
    </>
  );
}
