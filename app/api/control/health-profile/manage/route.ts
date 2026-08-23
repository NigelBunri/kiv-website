import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Full-array-replace write for the broadcast health profile blob — the
// client must resend the complete institutions[] array (all institutions
// it owns, not just the one being edited), since Django replaces the
// whole list on every call. See StaffWorkspace.tsx for the merge logic.
export async function POST(request: NextRequest) {
  return proxyToDjango(request, `/api/v1/broadcasts/profiles/manage/`, { method: "POST" });
}
