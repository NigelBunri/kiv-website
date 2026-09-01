import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Only ever called from the passive/algorithmic Feeds tab while it's
// on-screen (never from Channels/Watch/Subscriptions/Saved/Settings -
// those are intentional, user-directed actions the responsible-use
// policy explicitly does not want to throttle). Django ignores any
// client-sent elapsed value and credits server-clock time since the last
// heartbeat instead, so this call carries no body.
export async function POST(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/engagement/feed-heartbeat/", { method: "POST", forwardBody: false });
}
