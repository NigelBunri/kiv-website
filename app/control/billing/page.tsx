import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import BillingWorkspace from "./BillingWorkspace";

type Subscription = {
  id: string;
  status: string;
  started_at?: string;
  ends_at?: string | null;
  cancel_at_period_end?: boolean;
  grace_ends_at?: string | null;
} | null;

export default async function BillingPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { profile, session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/wallet/subscription/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const data = res.ok ? await res.json() : { subscription: null };
  const subscription: Subscription = data?.subscription || null;

  return (
    <>
      <div className="control-header">
        <h1>Billing</h1>
        <p>Your current plan and subscription.</p>
      </div>
      <BillingWorkspace tierName={profile.tierName} initialSubscription={subscription} />
    </>
  );
}
