import { SiteShell } from "@/components/SiteShell";

import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Child Safety", description: "Child-safety expectations for KIV and future KIS community features.", path: "/child-safety" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Child Safety", href: "/child-safety" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Child Safety</h1>
          <p>Child-safety expectations for KIV and future KIS community features.</p>
          <p>Public pages must not invite children to submit private credentials or sensitive personal information.</p>
<p>Future community features require moderation, reporting and age-appropriate safety review.</p>
<p>Child-safety processes must be verified before claims are strengthened.</p>
        </article>
      </section>

    </SiteShell>
  );
}
