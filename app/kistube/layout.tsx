import "./kistube.css";
import { KISTubeShell } from "@/components/kistube/KISTubeShell";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const metadata = {
  ...kistubeMetadata({
    title: "KISTube",
    description: "Watch with purpose: education, health, market, jobs, feeds and testimonies from the KIS community — all in one place.",
    path: "/kistube",
    robots: kistubeRobots(),
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
