import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { getKisTubeViewer } from "@/lib/kistube-viewer";
import { KISTubeAuthGate } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";
import { JobApplyButton } from "@/components/kistube/JobApplyButton";

export const revalidate = 0;

// Same shape as jobs/page.tsx's JobListing - JobListingViewSet is
// IsAuthenticated (not a public listing, unlike Market/Health), so this
// page is auth-gated the same way the list page already is, and fetches
// Django directly (Server Component - no self-referential /api/kistube hop).
type JobListing = {
  id: string;
  title: string;
  description: string;
  location?: string;
  remote_allowed: boolean;
  job_type?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  required_skills?: string[];
  deadline?: string | null;
  is_kingdom_certified: boolean;
  application_count: number;
  country?: string;
  industry?: string;
  [key: string]: unknown;
};

async function fetchJob(id: string): Promise<JobListing | null> {
  const auth = await getValidSession();
  if (!auth) return null;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/business/jobs/${encodeURIComponent(id)}/`, {
      headers: authHeaders(auth.session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as JobListing;
  } catch (error) {
    console.error("kistube job detail: fetch failed", error);
    return null;
  }
}

function salaryRange(job: JobListing): string {
  if (!job.salary_min && !job.salary_max) return "";
  const currency = job.currency || "";
  if (job.salary_min && job.salary_max) return `${job.salary_min}–${job.salary_max} ${currency}`.trim();
  if (job.salary_min) return `From ${job.salary_min} ${currency}`.trim();
  return `Up to ${job.salary_max} ${currency}`.trim();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJob(id);
  return kistubeMetadata({
    title: job?.title || "Job listing",
    description: job?.description?.slice(0, 200) || "Open role on KISTube Jobs.",
    path: `/kistube/jobs/${id}`,
    robots: kistubeRobots(false),
  });
}

export default async function KISTubeJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { viewer } = await getKisTubeViewer();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">Job listing</h1>
        <KISTubeAuthGate next={`/kistube/jobs/${id}`} body="Sign in to view and apply to this role." />
      </div>
    );
  }

  const job = await fetchJob(id);
  if (!job) notFound();

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 className="kt-page-heading" style={{ marginBottom: ".3rem" }}>
        {job.title}
        {job.is_kingdom_certified && <span className="kt-verified-badge" style={{ marginLeft: ".4rem" }}>✓</span>}
      </h1>
      <div className="kt-card-meta" style={{ marginBottom: ".5rem" }}>
        {[job.location, job.remote_allowed ? "Remote OK" : null, job.job_type].filter(Boolean).join(" · ")}
      </div>
      {salaryRange(job) && <div className="kt-card-meta" style={{ marginBottom: ".5rem" }}>{salaryRange(job)}</div>}

      {job.required_skills && job.required_skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem", marginBottom: "1rem" }}>
          {job.required_skills.map((skill) => (
            <span
              key={skill}
              style={{ fontSize: ".78rem", fontWeight: 600, padding: ".2rem .6rem", borderRadius: "var(--radius-full)", background: "var(--cream-2)", color: "var(--ink-soft)" }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <JobApplyButton jobId={job.id} />
      </div>

      <h2 className="kt-related-heading">About this role</h2>
      <p style={{ whiteSpace: "pre-wrap" }}>{job.description}</p>

      <div className="kt-card-meta" style={{ marginTop: "1.5rem" }}>
        {job.application_count} applicant{job.application_count === 1 ? "" : "s"} so far
        {job.deadline ? ` · Apply by ${new Date(job.deadline).toLocaleDateString()}` : ""}
      </div>
    </div>
  );
}
