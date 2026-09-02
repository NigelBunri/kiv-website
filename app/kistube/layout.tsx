import "./kistube.css";
import { KISTubeShell } from "@/components/kistube/KISTubeShell";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const metadata = {
  ...kistubeMetadata({
    title: "KISTube",
    // Named as an entity in its own right ("KISTube is the official video
    // platform of...") rather than a bare feature-list tagline - this is
    // the single description most pages under /kistube inherit (only a
    // handful set their own), so it's the primary first-party signal
    // Google reads for what "KISTube" actually is.
    description: "KISTube is the official video platform of Kingdom Impact Social (KIS), part of Kingdom Impact Ventures. Watch channels and discover education, health, market, jobs, feeds and testimonies from the KIS community.",
    path: "/kistube",
    robots: kistubeRobots(),
    // Bypasses the sitewide "%s | Kingdom Impact Ventures" title template
    // so the brand name "KISTube" leads the title tag directly, with the
    // parent-entity relationship stated in the title itself rather than
    // reduced to a generic corporate suffix.
    titleOverride: "KISTube | Official Video Platform of Kingdom Impact Social",
  }),
  manifest: "/kistube/manifest.webmanifest",
};

export default async function KISTubeLayout({ children }: { children: React.ReactNode }) {
  const { viewer, subscriptions, feedStatus } = await getKisTubeSidebarData();
  return (
    <KISTubeShell viewer={viewer} subscriptions={subscriptions} feedStatus={feedStatus}>
      {children}
    </KISTubeShell>
  );
}
