import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// NotificationBell polls this every ~45s for the badge count - a single
// cheap {"unread_count": n} call, not the full list.
export async function GET(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/notifications/unread-count/", { method: "GET" });
}
