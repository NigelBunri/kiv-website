import { SiteShell } from "@/components/SiteShell";
import { PublicForm } from "@/components/PublicForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Data Deletion", description: "Request deletion or review of personal data handled by KIV/KIS.", path: "/data-deletion" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Data Deletion", href: "/data-deletion" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Data Deletion</h1>
          <p>Request deletion or review of personal data handled by KIV/KIS.</p>
          <p>Data requests require identity verification and enough context to locate the relevant records.</p>
<p>Some records may need to be retained where law, security or dispute handling requires it.</p>
<p>The website provides the public starting point; product-specific workflows may be added later.</p>
        </article>
      </section>

      <section className="section">
        <div className="section-heading"><h2>Submit a request</h2><p>Use this form only for the stated purpose and never include passwords or private credentials.</p></div>
        <PublicForm kind="deletion" subject="Data Deletion request" />
      </section>
    </SiteShell>
  );
}
