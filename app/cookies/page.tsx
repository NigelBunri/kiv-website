import { Breadcrumbs, CardGrid, DetailList, Section } from "@/components/PageBlocks";
import { SiteShell } from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Cookies", description: "Cookie and analytics posture for the KIV website.", path: "/cookies" });

export default function Page() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Cookies", href: "/cookies" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Cookies</h1>
          <p>The public KIV website is built with a conservative cookie and analytics posture. Analytics are not enabled by default, and optional tracking should remain disabled unless a privacy-conscious provider is configured and documented.</p>
          <p>Functional form protection, spam prevention or security tooling may require limited browser-side behaviour in production, but those tools must be explained when they materially affect visitors.</p>
          <p>Cookie banners should only be added when tracking or storage behaviour requires them. KIV should avoid decorative compliance banners that do not describe the real behaviour of the site.</p>
        </article>
      </section>
      <Section title="Cookie and analytics states">
        <CardGrid
          items={[
            { title: "Default state", body: "No analytics are enabled by default in the public readiness build." },
            { title: "Configured analytics", body: "Future analytics must be privacy-conscious, documented and aligned with the production privacy review." },
            { title: "Form protection", body: "CAPTCHA or anti-spam controls may be enabled when public form delivery is configured." },
            { title: "Consent review", body: "Consent wording should match the actual storage and tracking behaviour used in production." },
          ]}
        />
      </Section>
      <Section title="Cookie categories" body="Drafted terms, pending legal review.">
        <DetailList
          items={[
            { title: "Strictly necessary", body: "A small amount of state needed to operate the site securely, such as the short-lived challenge cookie Cloudflare Turnstile sets when you submit a form. These cannot be switched off without breaking form submission." },
            { title: "Functional", body: "None currently in active use beyond the above. Any added in future will be listed here before deployment." },
            { title: "Analytics", body: "Not enabled by default. If enabled in future, we will use a privacy-conscious, cookie-light approach and update this page first." },
            { title: "Advertising", body: "Never used. This site does not run third-party ad tracking or sell visitor data." },
            { title: "Managing cookies", body: "Most browsers let you block or delete cookies in their settings. Blocking the Turnstile challenge cookie may prevent form submission." },
          ]}
        />
      </Section>

    </SiteShell>
  );
}
