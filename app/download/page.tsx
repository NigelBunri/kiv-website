import { PublicForm } from "@/components/PublicForm";
import { SiteShell } from "@/components/SiteShell";
import { Hero, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { productBySlug } from "@/lib/site";

export const metadata = pageMetadata({ title: "Download", description: "KIS availability and launch-list controls.", path: "/download" });

export default function DownloadPage() {
  const kis = productBySlug("kis")!;
  const hasStore = (kis.availability.android && kis.availability.googlePlayUrl) || (kis.availability.ios && kis.availability.appStoreUrl) || (kis.availability.web && kis.availability.webAppUrl);
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Download", href: "/download" }]} />
      <Hero eyebrow="KIS availability" title="KIS release actions appear only when configured." body="The download page supports coming-soon, Android, iOS and web states without fake links or automatic redirects." />
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
      <Section title="Launch list">
        <PublicForm kind="launch" subject="KIS launch list request" product="KIS" />
      </Section>
    </SiteShell>
  );
}
