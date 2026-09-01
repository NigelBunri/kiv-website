// Mirrors apps/websites/kis_content_resolvers.py's deep_link grammar
// exactly (KIS_APP_DEEP_LINK_BASE = "https://kis.app") so
// components/website-builder/OpenInApp.tsx - already built to convert an
// https://kis.app/... universal link into the native kis:// scheme - works
// unmodified for KISTube's watch/channel pages. Generic ChannelContent
// items use the resolver's "posts" grammar (resolve_posts), not a
// KISTube-specific one; a video is still a ChannelContent row either way.
const KIS_APP_DEEP_LINK_BASE = "https://kis.app";

export function kistubeContentDeepLink(contentId: string): string {
  return `${KIS_APP_DEEP_LINK_BASE}/posts/${contentId}`;
}

export function kistubeChannelDeepLink(handle: string): string {
  return `${KIS_APP_DEEP_LINK_BASE}/channels/${handle}`;
}
