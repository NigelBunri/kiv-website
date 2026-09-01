import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Backs the full "Subscriptions" page (paginated) - the layout's sidebar
// preview list comes from lib/kistube-viewer.ts's direct server-side
// fetch instead, to avoid a self-referential HTTP call on every page load.
export async function GET(request: NextRequest) {
  return proxyToDjango(request, `/api/v1/broadcasts/my-subscriptions/${request.nextUrl.search}`, { method: "GET" });
}
