import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; membershipId: string }> }) {
  const { id, membershipId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/memberships/${encodeURIComponent(membershipId)}/student-detail/`, { method: "GET" });
}
