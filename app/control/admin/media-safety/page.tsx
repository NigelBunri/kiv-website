import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import MediaSafetyScanTable from "./MediaSafetyScanTable";

type Summary = { total: number; by_status: { status: string; count: number }[] };

export default async function AdminMediaSafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);
  const { status } = await searchParams;

  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const [scansRes, summaryRes] = await Promise.all([
    fetch(`${kisApiBase()}/control/admin/media-safety/scans/${query}`, { headers, cache: "no-store", signal: AbortSignal.timeout(20_000) }),
    fetch(`${kisApiBase()}/control/admin/media-safety/summary/`, { headers, cache: "no-store", signal: AbortSignal.timeout(20_000) }),
  ]);
  const scansData = scansRes.ok ? await scansRes.json() : { scans: [] };
  const summary: Summary | null = summaryRes.ok ? await summaryRes.json() : null;

  return (
    <>
      <div className="control-header">
        <h1>Media safety scans</h1>
        <p>
          Every AI content-safety verdict (NudeNet), independent of the moderation queue below it — this is the
          ground truth for what the scanner actually caught on every image, video, or file upload.
        </p>
      </div>

      {summary ? (
        <div className="control-stat-grid">
          <div className="control-stat-card"><span>Total scans</span><strong>{summary.total}</strong></div>
          {summary.by_status.map((row) => (
            <div className="control-stat-card" key={row.status}><span>{row.status}</span><strong>{row.count}</strong></div>
          ))}
        </div>
      ) : null}

      <section className="control-section">
        <h2>Scans</h2>
        <MediaSafetyScanTable scans={scansData.scans || []} activeStatus={status || ""} />
      </section>
    </>
  );
}
