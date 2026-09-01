import { proxyToDjango } from "@/lib/controlProxy";
import { NextRequest } from "next/server";

// WatchHistoryView.get() (apps.broadcasts) only returns
// {content_id, progress_seconds, completed, last_viewed_at} rows - no
// title/thumbnail. The History page hydrates each row via
// fetchPublicContent() server-side (same N+1-but-small-and-parallel
// pattern as the Saved/watch-later page, capped at 50 rows upstream).
export async function GET(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/broadcasts/watch-history/", { method: "GET" });
}
