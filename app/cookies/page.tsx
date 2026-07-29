import { SiteShell } from "@/components/SiteShell";

import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Cookies", description: "Cookie and analytics posture for the KIV website.", path: "/cookies" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Cookies", href: "/cookies" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Cookies</h1>
          <p>Cookie and analytics posture for the KIV website.</p>
          <p>The website does not enable analytics by default.</p>
<p>Optional analytics must be privacy-conscious, documented and disabled unless configured.</p>
<p>Cookie banners should only be added when tracking or storage behavior requires them.</p>
        </article>
      </section>

    </SiteShell>
  );
}
