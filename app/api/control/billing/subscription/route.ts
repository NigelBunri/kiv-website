import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/wallet/subscription/", { method: "GET" });
}
