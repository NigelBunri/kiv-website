import { SiteShell } from "@/components/SiteShell";
import { PublicForm } from "@/components/PublicForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Account Deletion", description: "Request account deletion help without sharing credentials.", path: "/account-deletion" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Account Deletion", href: "/account-deletion" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Account Deletion</h1>
          <p>Request account deletion help without sharing credentials.</p>
          <p>Use the deletion request flow or support contact to begin verification.</p>
<p>Do not submit passwords, one-time codes or private recovery details.</p>
<p>KIV must verify ownership before account changes.</p>
        </article>
      </section>

      <section className="section">
        <div className="section-heading"><h2>Submit a request</h2><p>Use this form only for the stated purpose and never include passwords or private credentials.</p></div>
        <PublicForm kind="deletion" subject="Account Deletion request" />
      </section>
    </SiteShell>
  );
}
