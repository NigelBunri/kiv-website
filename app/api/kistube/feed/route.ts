import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// BroadcastFeedView (apps.broadcasts) is the real, server-enforced
// responsible-engagement feed: IsAuthenticated, and returns
// {results: [], feed_limit: {...limit_reached: true}} once the daily
// watch-time cap is hit rather than an error - the Feeds page renders
// that state directly rather than treating it as a fetch failure.
export async function GET(request: NextRequest) {
  return proxyToDjango(request, `/api/v1/broadcasts/${request.nextUrl.search}`, { method: "GET" });
}
