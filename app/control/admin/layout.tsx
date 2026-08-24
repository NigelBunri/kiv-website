import { redirect } from "next/navigation";
import { fetchControlProfile } from "@/lib/controlAuth";

// UX guard only - the real security boundary is admin_control's own
// IsAdminControlUser permission class on every proxied endpoint below, so
// a client-side bypass attempt still 403s server-side. This just avoids
// showing GO-only nav/pages to someone who isn't.
export default async function ControlAdminLayout({ children }: { children: React.ReactNode }) {
  const result = await fetchControlProfile();
  if (!result || !result.profile.isSuperuser) redirect("/control");
  return <>{children}</>;
}
