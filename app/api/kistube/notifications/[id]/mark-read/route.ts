import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Note: Django's URL uses mark_read (underscore) even though this route's
// own path segment is mark-read (hyphen), matching this repo's route
// naming convention elsewhere under app/api/kistube/**.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToDjango(request, `/api/v1/notifications/${encodeURIComponent(id)}/mark_read/`, { method: "POST" });
}
