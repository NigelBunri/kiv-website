import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Resolves a phone number to an existing user id — used by staff
// management to add a member by phone (there is no email/invite-token
// flow on the backend, only direct userId lookup by phone).
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone") || "";
  return proxyToDjango(request, `/api/v1/users/check-contacts/?phone=${encodeURIComponent(phone)}`, { method: "GET" });
}
