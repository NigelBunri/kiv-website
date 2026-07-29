import { SiteShell } from "@/components/SiteShell";

import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Community Guidelines", description: "Community expectations for KIV and KIS public communication.", path: "/community-guidelines" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Community Guidelines", href: "/community-guidelines" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Community Guidelines</h1>
          <p>Community expectations for KIV and KIS public communication.</p>
          <p>KIS community behavior must protect dignity, safety, truthfulness and lawful use.</p>
<p>Detailed in-product rules must be reviewed before wide public launch.</p>
<p>These guidelines are public readiness content, not a substitute for product moderation policy.</p>
        </article>
      </section>

    </SiteShell>
  );
}
