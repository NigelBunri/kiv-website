import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  return proxyToDjango(request, `/api/v1/verification/staff/cases/${search}`, { method: "GET" });
}
