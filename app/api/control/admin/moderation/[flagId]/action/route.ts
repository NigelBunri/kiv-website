import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ flagId: string }> }) {
  const { flagId } = await params;
  return proxyToDjango(request, `/control/admin/content/flags/${encodeURIComponent(flagId)}/action/`, { method: "POST" });
}
