import { SiteShell } from "@/components/SiteShell";

import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Acceptable Use", description: "Acceptable-use expectations for KIV public channels.", path: "/acceptable-use" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Acceptable Use", href: "/acceptable-use" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Acceptable Use</h1>
          <p>Acceptable-use expectations for KIV public channels.</p>
          <p>Do not submit unlawful, abusive, harmful, deceptive or credential-bearing content through public forms.</p>
<p>KIV may reject requests that appear abusive, automated or unsafe.</p>
<p>Future product communities will require product-specific rules before public operation.</p>
        </article>
      </section>

    </SiteShell>
  );
}
