import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import RevenueWorkspace from "./RevenueWorkspace";
import { fetchMyChannels, pickChannel } from "../resolveChannel";
import { ChannelSwitcher } from "../ChannelSwitcher";

type PayoutRequest = {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  period_start?: string;
  period_end?: string;
  payment_method_ref?: string;
  notes?: string;
  created_at: string;
};

export default async function ChannelRevenuePage({ searchParams }: { searchParams: Promise<{ channel?: string }> }) {
  const { channel: requestedChannelId } = await searchParams;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const channels = await fetchMyChannels(headers);
  const channel = pickChannel(channels, requestedChannelId);
  if (!channel) notFound();

  const [revenueRes, payoutRes] = await Promise.all([
    fetch(`${kisApiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channel.id)}/revenue/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
    fetch(`${kisApiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channel.id)}/payout-requests/`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }),
  ]);
  const revenue = revenueRes.ok ? await revenueRes.json() : null;
  const payoutData = payoutRes.ok ? await payoutRes.json() : [];
  const payoutRequests: PayoutRequest[] = Array.isArray(payoutData) ? payoutData : [];

  return (
    <>
      <ChannelSwitcher channels={channels} activeId={channel.id} basePath="/control/channel/revenue" />
      <div className="control-header">
        <h1>Revenue</h1>
        <p>Earnings summary and payout request history for {channel.display_name}.</p>
      </div>
      <RevenueWorkspace channelId={channel.id} initialRevenue={revenue} initialPayoutRequests={payoutRequests} />
    </>
  );
}
