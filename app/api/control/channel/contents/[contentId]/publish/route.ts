import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  // forwardBody used to be false, but Django's publish view honors an
  // explicit `visibility` in the body (falling back to the content's
  // current visibility, then to PUBLIC) - with the body dropped, the
  // client's "Publish" action could never actually request public
  // visibility, and since a ChannelContent's visibility is never empty
  // (defaults to "private" at creation), the "current visibility" fallback
  // always won and PUBLIC was unreachable. Content could reach
  // status=published but never become publicly visible.
  return proxyToDjango(request, `/api/v1/broadcasts/channel-contents/${encodeURIComponent(contentId)}/publish/`, { method: "POST", forwardBody: true });
}
