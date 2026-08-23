import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/health-ops/institutions/", { method: "POST" });
}
