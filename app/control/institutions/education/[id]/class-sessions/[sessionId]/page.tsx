import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ClassSessionWorkspace from "./ClassSessionWorkspace";
import { BackLink } from "@/app/control/BackLink";

export default async function ClassSessionDetailPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session: authSession } = result;
  const headers = authHeaders(authSession);

  const res = await fetch(
    `${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/class-sessions/${encodeURIComponent(sessionId)}/`,
    { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) },
  );
  if (!res.ok) notFound();
  const data = await res.json();

  return (
    <>
      <BackLink href={`/control/institutions/education/${id}/class-sessions`} label="Back to class sessions" />
      <div className="control-header">
        <h1>{data?.class_session?.title || "Class session"}</h1>
        <p>Manage this class session&rsquo;s schedule and details.</p>
      </div>
      <ClassSessionWorkspace institutionId={id} sessionId={sessionId} initialSession={data?.class_session} />
    </>
  );
}
