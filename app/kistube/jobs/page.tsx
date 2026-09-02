import type { Metadata } from "next";
import Link from "next/link";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { getKisTubeViewer } from "@/lib/kistube-viewer";
import { KISTubeAuthGate, KISTubeEmptyState, KISTubeErrorState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";
import { formatRelativeTime } from "@/lib/kistube-format";
import { JobApplyButton } from "@/components/kistube/JobApplyButton";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Jobs",
  description: "Open roles posted across the KIS community.",
  path: "/kistube/jobs",
  robots: kistubeRobots(),
});

// JobListingViewSet (apps.commerce.business_views) — DRF ModelViewSet with
// the project's default PageNumberPagination, so the response shape is
// {meta: {...}, results: [...]}, not the {results, next_cursor} shape used
// elsewhere in KISTube.
type JobListing = {
  id: string;
  poster: string;
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
  is_active: boolean;
  is_kingdom_certified: boolean;
  application_count: number;
  country?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

type JobsResponse = { meta: { count: number; page_size: number; current: number; total_pages: number }; results: JobListing[] };

async function fetchJobs(): Promise<JobsResponse | null | "error"> {
  const auth = await getValidSession();
  if (!auth) return null;
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/business/jobs/?is_active=true`, {
      headers: authHeaders(auth.session),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return "error";
    return (await res.json()) as JobsResponse;
  } catch (error) {
    console.error("kistube jobs: listing fetch failed", error);
    return "error";
  }
}

function salaryRange(job: JobListing): string {
  if (!job.salary_min && !job.salary_max) return "";
  const currency = job.currency || "";
  if (job.salary_min && job.salary_max) return `${job.salary_min}–${job.salary_max} ${currency}`.trim();
  if (job.salary_min) return `From ${job.salary_min} ${currency}`.trim();
  return `Up to ${job.salary_max} ${currency}`.trim();
}

export default async function KISTubeJobsPage() {
  const { viewer } = await getKisTubeViewer();
  if (!viewer.signedIn) {
    return (
      <div>
        <h1 className="kt-page-heading">Jobs</h1>
        <p className="kt-page-subheading">Open roles posted across the KIS community.</p>
        <KISTubeAuthGate next="/kistube/jobs" body="Sign in to browse and apply to jobs posted across the KIS community." />
      </div>
    );
  }

  const jobs = await fetchJobs();

  return (
    <div>
      <h1 className="kt-page-heading">Jobs</h1>
      <p className="kt-page-subheading">Open roles posted across the KIS community.</p>

      {jobs === "error" && (
        <KISTubeErrorState body="Unable to load job listings right now. Please try again shortly." />
      )}

      {jobs && jobs !== "error" && (
        jobs.results.length === 0 ? (
          <KISTubeEmptyState title="No open roles right now" body="Check back soon — new job listings from the KIS community show up here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {jobs.results.map((job) => (
              <div
                key={job.id}
                style={{
                  border: "1px solid var(--line-soft)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.1rem 1.25rem",
                  background: "var(--surface)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1.25rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 220 }}>
                  <h3 style={{ margin: "0 0 .3rem", fontSize: "1.05rem", fontWeight: 700 }}>
                    <Link href={`/kistube/jobs/${job.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {job.title}
                    </Link>
                    {job.is_kingdom_certified && <span className="kt-verified-badge" style={{ marginLeft: ".35rem" }}>✓</span>}
                  </h3>
                  <div className="kt-card-meta" style={{ marginBottom: ".4rem" }}>
                    {[job.location, job.remote_allowed ? "Remote OK" : null, job.job_type].filter(Boolean).join(" · ")}
                  </div>
                  {salaryRange(job) && <div className="kt-card-meta" style={{ marginBottom: ".4rem" }}>{salaryRange(job)}</div>}
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem", marginBottom: ".4rem" }}>
                      {job.required_skills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            fontSize: ".72rem",
                            fontWeight: 600,
                            padding: ".15rem .55rem",
                            borderRadius: "var(--radius-full)",
                            background: "var(--cream-2)",
                            color: "var(--ink-soft)",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {job.deadline && <div className="kt-card-meta">Apply by {formatRelativeTime(job.deadline)}</div>}
                </div>
                <div style={{ flexShrink: 0, alignSelf: "center" }}>
                  <JobApplyButton jobId={job.id} />
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
