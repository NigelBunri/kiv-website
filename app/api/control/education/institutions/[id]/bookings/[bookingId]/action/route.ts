import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; bookingId: string }> }) {
  const { id, bookingId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/bookings/${encodeURIComponent(bookingId)}/action/`, { method: "POST" });
}
