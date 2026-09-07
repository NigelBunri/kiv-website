import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Mirrors app/api/control/education/uploads/[uploadId]/confirm/route.ts -
// Django's confirm endpoint is not context-specific in its URL (context
// lives on the MediaUploadIntent row created at initiate time), so this is
// the exact same thin proxy shape.
export async function POST(request: NextRequest, { params }: { params: Promise<{ uploadId: string }> }) {
  const { uploadId } = await params;
  return proxyToDjango(request, `/api/v1/media/uploads/${encodeURIComponent(uploadId)}/confirm/`, { method: "POST", forwardBody: false });
}
