import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import MaterialWorkspace from "./MaterialWorkspace";
import { BackLink } from "@/app/control/BackLink";

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string; materialId: string }> }) {
  const { id, materialId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(
    `${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/materials/${encodeURIComponent(materialId)}/`,
    { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) },
  );
  if (!res.ok) notFound();
  const data = await res.json();

  return (
    <>
      <BackLink href={`/control/institutions/education/${id}/materials`} label="Back to materials" />
      <div className="control-header">
        <h1>{data?.material?.title || "Material"}</h1>
        <p>Manage this material&rsquo;s details.</p>
      </div>
      <MaterialWorkspace institutionId={id} materialId={materialId} initialMaterial={data?.material} />
    </>
  );
}
