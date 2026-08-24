import { redirect } from "next/navigation";
import { fetchControlProfile, isControlPanelEligible } from "@/lib/controlAuth";
import { ControlProvider } from "./ControlContext";
import ControlShell from "./ControlShell";
import { Section } from "@/components/PageBlocks";
import { SiteShell } from "@/components/SiteShell";

export const metadata = { title: "Control panel - KIS", robots: { index: false, follow: false } };

export default async function ControlLayout({ children }: { children: React.ReactNode }) {
  const result = await fetchControlProfile();
  if (!result) redirect("/login?next=/control");
  const { profile } = result;

  if (!isControlPanelEligible(profile)) {
    return (
      <SiteShell>
        <main className="content-page">
          <Section
            title="Control panel"
            body={`This is available on Business Pro, Partner, and Partner Pro plans. You're currently on ${profile.tierName}.`}
          >
            <div className="card">
              <p>
                Upgrade your plan in the KIS app to manage your shops, institutions, or partner
                organization from a computer instead of your phone.
              </p>
              <a className="button primary" href="/#pricing">See plans</a>
            </div>
          </Section>
        </main>
      </SiteShell>
    );
  }

  return (
    <ControlProvider profile={profile}>
      <ControlShell>{children}</ControlShell>
    </ControlProvider>
  );
}
