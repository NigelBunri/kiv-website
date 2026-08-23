import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import ModerationQueue from "./ModerationQueue";

type ModerationRecord = {
  id: string;
  target_type: string;
  reason?: string;
  status: string;
  action: string;
  content_title?: string;
  comment_body?: string;
  reporter_display?: string;
  created_at: string;
};

export default async function ChannelModerationPage() {
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const listRes = await fetch(`${kisApiBase()}/api/v1/broadcasts/channels/?mine=1`, { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  const listData = listRes.ok ? await listRes.json() : {};
  const channel = Array.isArray(listData?.results) ? listData.results[0] : null;
  if (!channel) notFound();

  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/channels/${encodeURIComponent(channel.id)}/moderation/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const data = res.ok ? await res.json() : {};
  const records: ModerationRecord[] = Array.isArray(data?.results) ? data.results : [];

  return (
    <>
      <div className="control-header">
        <h1>Moderation</h1>
        <p>Reported content and comments on {channel.display_name}.</p>
      </div>
      <ModerationQueue initialRecords={records} />
    </>
  );
}
