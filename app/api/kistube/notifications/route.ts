import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Thin pass-through to apps.notifications' NotificationViewSet list action
// (IsAuthenticated) - a GLOBAL notification feed shared by the whole KIS
// app (chat, calls, broadcasts, etc.), not just KISTube. Forwards the
// query string as-is so callers can pass unread=true&limit=&offset=.
export async function GET(request: NextRequest) {
  return proxyToDjango(request, `/api/v1/notifications/${request.nextUrl.search}`, { method: "GET" });
}
