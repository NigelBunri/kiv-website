import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest) {
  return proxyToDjango(request, "/control/admin/devices/wipe-all/", { method: "POST" });
}
