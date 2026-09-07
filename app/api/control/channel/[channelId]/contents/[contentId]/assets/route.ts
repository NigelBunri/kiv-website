import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

// Proxies to apps.broadcasts.views.ChannelContentAssetUploadView - the ONE
// endpoint that actually queues a kisvideo transcode (behind
// KIS_VIDEO_SERVICE_ENABLED) for asset_type in ("video", "short_video").
// channelId isn't part of the upstream path (content ownership is checked
// server-side against the authenticated user, not the URL), same as the
// existing attachment/route.ts's own note about this endpoint shape.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string; contentId: string }> },
) {
  const { contentId } = await params;
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/assets/`, { method: "POST" });
}
