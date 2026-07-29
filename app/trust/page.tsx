import { SiteShell } from "@/components/SiteShell";

import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Trust", description: "KIV trust posture and public launch safeguards.", path: "/trust" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Trust", href: "/trust" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Trust</h1>
          <p>KIV trust posture and public launch safeguards.</p>
          <p>KIV separates verified facts from planned work.</p>
<p>Destructive, financial, health and credential workflows require specific review before public claims.</p>
<p>Public forms explain delivery behavior and avoid collecting secrets.</p>
        </article>
      </section>

    </SiteShell>
  );
}
