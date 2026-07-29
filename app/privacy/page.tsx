import { SiteShell } from "@/components/SiteShell";

import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Privacy", description: "How KIV handles public website and request data.", path: "/privacy" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Privacy", href: "/privacy" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Privacy</h1>
          <p>How KIV handles public website and request data.</p>
          <p>KIV collects only the information needed to respond to public website, partner, investor, launch-list, deletion or security requests.</p>
<p>Server-side providers must be configured without exposing secrets to the browser.</p>
<p>Legal review is required before production launch.</p>
        </article>
      </section>

    </SiteShell>
  );
}
