import { SiteShell } from "@/components/SiteShell";
import { PublicForm } from "@/components/PublicForm";
import { CardGrid, ImageStory, Section } from "@/components/PageBlocks";
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
          <p>The website uses security headers, server-side validation, honeypot protection, CAPTCHA support and per-visitor submission rate limiting on every public form.</p>
          <p>Rate limiting uses an in-memory counter by default, which is correct for a single-replica deployment. If this site is ever scaled to multiple replicas, setting <code>REDIS_URL</code> switches it to a shared Redis-backed limiter so the limit applies across replicas rather than per-replica.</p>
          <p>Security reports should include enough technical detail to reproduce the issue, but should not include passwords, API keys, recovery codes, private messages or unrelated personal records.</p>
        </article>
      </section>
      <ImageStory
        src="/images/kiv-trust-security-visual.jpg"
        alt="A secure public website workflow with privacy shield, secure form, data vault and review gates."
        eyebrow="Security posture"
        title="Public security reports need safe detail and careful handling."
        body="The security route exists for vulnerability reports and abuse concerns while keeping unrelated private data out of the form."
        points={[
          "Include affected page, steps, browser and expected impact.",
          "Do not submit credentials, private user data or exploit payloads that damage systems.",
          "Production controls require provider configuration and deployment review.",
        ]}
      />
      <Section title="Security controls explained" body="These controls apply to the public website and its request workflows.">
        <CardGrid items={[
          { title: "Headers", body: "Security headers reduce browser exposure, frame embedding, MIME sniffing and over-broad permissions." },
          { title: "Validation", body: "Server-side form validation constrains request type, message length, required fields and unsafe payload shape." },
          { title: "Bot protection", body: "Honeypot and CAPTCHA support reduce automated abuse while keeping local development usable." },
          { title: "Rate limiting", body: "Enforced on every public form submission; shared across replicas automatically once REDIS_URL is configured." },
          { title: "Secret handling", body: "Provider secrets stay server-side. Public environment variables are limited to values intended for browsers." },
          { title: "Incident routing", body: "Security reports use a dedicated form and security contact address instead of the general contact workflow." },
        ]} />
      </Section>
      <Section title="Submit a request" body="Use this form only for the stated purpose and never include passwords or private credentials.">
        <PublicForm kind="security" subject="Security report" />
      </Section>
    </SiteShell>
  );
}
