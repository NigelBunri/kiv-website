import { PublicForm } from "@/components/PublicForm";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, CardGrid, Hero, ImageStory, Section, Timeline } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";
import { launchWorkflow, productBySlug } from "@/lib/site";

export const metadata = pageMetadata({ title: "Download", description: "KIS availability and launch-list controls.", path: "/download", image: { url: "/images/kis-availability-visual-1200.jpg", width: 1200, height: 675, alt: "KIS availability across Android, iOS and web-app launch states." } });

export default function DownloadPage() {
  const kis = productBySlug("kis")!;
  const hasStore = (kis.availability.android && kis.availability.googlePlayUrl) || (kis.availability.ios && kis.availability.appStoreUrl) || (kis.availability.web && kis.availability.webAppUrl);
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Download", href: "/download" }]} />
      <Hero eyebrow="KIS availability" title="KIS release actions appear only when configured." body="The download page supports coming-soon, Android, iOS and web states without fake links or automatic redirects." />
      <ImageStory
        src="/images/kis-availability-visual.jpg"
        alt="A KIS release-control dashboard showing coming-soon, launch-list, Android, iOS and web availability states controlled by readiness gates."
        eyebrow="Availability states"
        title="The site shows only the release paths that are actually configured."
        body="KIS availability is controlled through environment configuration so visitors are never sent to fake app-store, web-app or download destinations."
        points={[
          "Coming soon is the safe default.",
          "Launch-list collection can stay available before public release.",
          "Android, iOS and web links appear only after official URLs exist.",
        ]}
      />
      <Section title="Current configured state">
        <div className="download-state">
          <h2>{hasStore ? "Configured release links are available" : "Coming soon"}</h2>
          <p>{hasStore ? "Use the configured official links below." : "KIS is in advanced launch preparation. Official store and web-app links will appear only after configuration."}</p>
          <div className="action-row">
            {kis.availability.android && kis.availability.googlePlayUrl ? <a className="button primary" href={kis.availability.googlePlayUrl} target="_blank" rel="noopener noreferrer">Google Play</a> : null}
            {kis.availability.ios && kis.availability.appStoreUrl ? <a className="button primary" href={kis.availability.appStoreUrl} target="_blank" rel="noopener noreferrer">App Store</a> : null}
            {kis.availability.web && kis.availability.webAppUrl ? <a className="button primary" href={kis.availability.webAppUrl} target="_blank" rel="noopener noreferrer">Web app</a> : null}
          </div>
        </div>
      </Section>
      <Section title="What each state means" body="These states help visitors understand why a button may or may not appear.">
        <CardGrid items={[
          { title: "Coming soon", body: "No public download destination is shown. Visitors can read product context and, when enabled, join the launch list." },
          { title: "Launch list", body: "The form captures interest without pretending that app delivery has occurred." },
          { title: "Android available", body: "The Google Play action appears only when Android availability and an official Google Play URL are configured." },
          { title: "iOS available", body: "The App Store action appears only when iOS availability and an official App Store URL are configured." },
          { title: "Web app available", body: "The web-app action appears only when a reviewed public web URL is configured." },
        ]} />
      </Section>
      <Section title="Release workflow" body="The download page is the final public expression of the wider launch-readiness process.">
        <Timeline items={launchWorkflow} />
      </Section>
      <Section title="Launch list">
        <PublicForm kind="launch" subject="KIS launch list request" product="KIS" />
      </Section>
    </SiteShell>
  );
}
