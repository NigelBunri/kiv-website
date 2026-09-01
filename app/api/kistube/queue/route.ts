import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/broadcasts/queue/", { method: "GET" });
}

export async function POST(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/broadcasts/queue/", { method: "POST" });
}

// ChannelContentQueueView.delete reads content_id from the request body,
// not a query param - proxyToDjango defaults DELETE to no forwarded body,
// so this must opt in explicitly.
export async function DELETE(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/broadcasts/queue/", { method: "DELETE", forwardBody: true });
}
