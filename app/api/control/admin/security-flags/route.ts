import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  return proxyToDjango(request, `/control/admin/activity/flags/${search}`, { method: "GET" });
}

export async function PATCH(request: NextRequest) {
  return proxyToDjango(request, "/control/admin/activity/flags/", { method: "PATCH" });
}
