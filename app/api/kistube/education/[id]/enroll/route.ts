import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// EducationContentEnrollmentView handles both free (immediate ENROLLED)
// and paid (creates a booking + payment intent) content in one call - the
// wrapped response's .data.booking.payment_url is where to redirect for
// paid enrollments, same "create something, read back a payment_url"
// shape as Market's checkout route.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/education/contents/${encodeURIComponent(id)}/enroll/`, { method: "POST" });
}
