import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// admin_control is mounted at /control/admin/ on the Django side (not
// /api/v1/...) - config/urls.py: path("control/admin/", include("admin_control.urls")).
export async function GET(request: NextRequest) {
  return proxyToDjango(request, "/control/admin/dashboard/overview/", { method: "GET" });
}
