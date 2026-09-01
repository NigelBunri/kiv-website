import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Backs the sidebar Watch-time panel - apps/accounts/responsible_feed.py's
// feed_usage_status(), fully server-authoritative (see
// components/kistube/KISTubeWatchTimePanel.tsx for why the client never
// computes this itself).
export async function GET(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/engagement/feed-status/", { method: "GET" });
}
