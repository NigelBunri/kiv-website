import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ProgramWorkspace from "./ProgramWorkspace";

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string; programId: string }> }) {
  const { id, programId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(
    `${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/programs/${encodeURIComponent(programId)}/`,
    { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) },
  );
  if (!res.ok) notFound();
  const data = await res.json();

  return (
    <>
      <div className="control-header">
        <h1>{data?.program?.title || "Program"}</h1>
        <p>Manage this program&rsquo;s details.</p>
      </div>
      <ProgramWorkspace institutionId={id} programId={programId} initialProgram={data?.program} />
    </>
  );
}
