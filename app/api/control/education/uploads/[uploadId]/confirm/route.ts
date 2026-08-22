import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ uploadId: string }> }) {
  const { uploadId } = await params;
  return proxyToDjango(request, `/api/v1/media/uploads/${encodeURIComponent(uploadId)}/confirm/`, { method: "POST", forwardBody: false });
}
