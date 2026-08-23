import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ProgramCreateForm from "./ProgramCreateForm";

type Program = { id: string; title: string; code?: string; status: string };

export default async function ProgramsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/programs/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) notFound();
  const data = await res.json();
  const programs: Program[] = Array.isArray(data?.programs) ? data.programs : [];

  return (
    <>
      <div className="control-header">
        <h1>Programs</h1>
        <p>Group related courses together under a program.</p>
      </div>

      <ProgramCreateForm institutionId={id} />

      <section className="control-section">
        <h2>All programs</h2>
        {programs.length === 0 ? (
          <div className="control-empty">No programs yet.</div>
        ) : (
          <div className="control-list">
            {programs.map((program) => (
              <div key={program.id} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{program.title}</div>
                  <div className="control-list-row-meta">{program.code}</div>
                </div>
                <span className={`control-badge control-badge--${program.status === "published" ? "active" : program.status === "archived" ? "inactive" : "pending"}`}>{program.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
