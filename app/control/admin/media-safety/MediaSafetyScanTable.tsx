"use client";

import Link from "next/link";
import { RevealableMedia } from "../RevealableMedia";

type Scan = {
  id: string;
  owner_id: string | null;
  context: string;
  original_name: string;
  mime_type: string;
  status: string;
  quarantine: boolean;
  requires_review: boolean;
  reason: string;
  score: number | null;
  created_at: string | null;
  has_media: boolean;
};

const STATUS_FILTERS = ["", "blocked", "pending_review", "passed", "failed", "not_configured"] as const;

function statusBadgeClass(status: string): string {
  if (status === "blocked" || status === "failed") return "control-badge control-badge--inactive";
  if (status === "pending_review") return "control-badge control-badge--pending";
  if (status === "passed") return "control-badge control-badge--active";
  return "control-badge";
}

export default function MediaSafetyScanTable({ scans, activeStatus }: { scans: Scan[]; activeStatus: string }) {
  return (
    <>
      <div className="control-actions" style={{ marginBottom: "1rem", flexWrap: "wrap" }}>
        {STATUS_FILTERS.map((value) => (
          <Link
            key={value || "all"}
            href={value ? `/control/admin/media-safety?status=${value}` : "/control/admin/media-safety"}
            className={`button ${activeStatus === value ? "primary" : "secondary"}`}
          >
            {value || "All"}
          </Link>
        ))}
      </div>

      {scans.length === 0 ? (
        <div className="control-empty">No scans match this filter.</div>
      ) : (
        <div className="control-table-wrap">
          <table className="control-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Context</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Score</th>
                <th>When</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan.id}>
                  <td>{scan.original_name || scan.mime_type || "—"}</td>
                  <td>{scan.context}</td>
                  <td><span className={statusBadgeClass(scan.status)}>{scan.status}</span></td>
                  <td>{scan.reason || "—"}</td>
                  <td>{scan.score != null ? scan.score.toFixed(2) : "—"}</td>
                  <td>{scan.created_at ? new Date(scan.created_at).toLocaleString() : "—"}</td>
                  <td>
                    {scan.has_media ? (
                      <RevealableMedia scanId={scan.id} mimeType={scan.mime_type} />
                    ) : (
                      <span className="control-note">No file stored</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
