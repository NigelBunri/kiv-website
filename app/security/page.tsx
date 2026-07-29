import { SiteShell } from "@/components/SiteShell";
import { PublicForm } from "@/components/PublicForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Security", description: "Security reporting and public controls for the KIV website.", path: "/security" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Security", href: "/security" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Security</h1>
          <p>Security reporting and public controls for the KIV website.</p>
          <p>Report suspected vulnerabilities without including unrelated personal data or credentials.</p>
<p>The website uses security headers, server-side validation, honeypot protection and rate-limit scaffolding.</p>
<p>Distributed rate limiting requires shared storage such as Redis, Durable Objects or provider-native protection.</p>
        </article>
      </section>

      <section className="section">
        <div className="section-heading"><h2>Submit a request</h2><p>Use this form only for the stated purpose and never include passwords or private credentials.</p></div>
        <PublicForm kind="security" subject="Security report" />
      </section>
    </SiteShell>
  );
}
