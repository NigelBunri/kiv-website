import { kisApiBase } from "@/lib/session";

// The website previously always used channels[0] (most-recently-updated)
// with no way to see or switch to any other channel the user manages -
// unlike the RN app's ChannelStudioScreen, which lets the user pick among
// all their channels via a pill switcher (useChannelsData({mine: true})
// + a horizontal ScrollView of channel pills). A user managing more than
// one channel (e.g. a personal channel plus a shop/institution-owned one)
// could post content that only ever showed up in the app, never on the
// website, with no error and no indication another channel existed.
export type ChannelSummary = {
  id: string;
  handle: string;
  display_name: string;
  [key: string]: unknown;
};

export async function fetchMyChannels(headers: HeadersInit): Promise<ChannelSummary[]> {
  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/channels/?mine=1`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const data = res.ok ? await res.json() : {};
  return Array.isArray(data?.results) ? data.results : [];
}

// Mirrors the app's default (channels[0], the most recently updated) when
// no explicit selection is present or the requested id doesn't match any
// channel this user manages.
export function pickChannel(channels: ChannelSummary[], requestedId?: string): ChannelSummary | null {
  if (requestedId) {
    const match = channels.find((channel) => channel.id === requestedId);
    if (match) return match;
  }
  return channels[0] || null;
}
