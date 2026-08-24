import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Reads the legacy per-user broadcast "health profile" JSON blob
// (apps.broadcasts.BroadcastHealthProfile) - this is the system that
// actually backs staff/role management and (indirectly, via a relational
// mirror synced on every write) availability scheduling. It is a
// separate, unlinked system from apps.health_ops.HealthInstitution, which
// backs the institution list/create/edit/services pages - see
// StaffWorkspace.tsx for how the two are reconciled per-institution.
export async function GET(request: NextRequest) {
  return proxyToDjango(request, `/api/v1/broadcasts/profiles/create/`, { method: "GET" });
}
