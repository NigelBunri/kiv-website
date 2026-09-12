import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest) {
  return proxyToDjango(request, "/control/admin/media-safety/summary/", { method: "GET" });
}
