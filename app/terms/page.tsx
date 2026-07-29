import { SiteShell } from "@/components/SiteShell";

import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Terms", description: "Terms for using the public KIV website.", path: "/terms" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Terms", href: "/terms" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Terms</h1>
          <p>Terms for using the public KIV website.</p>
          <p>The public website provides information about KIV and its products. It does not create an investment offer, partnership agreement or product entitlement.</p>
<p>Product availability depends on reviewed configuration and official release links.</p>
<p>Legal review is required before production launch.</p>
        </article>
      </section>

    </SiteShell>
  );
}
