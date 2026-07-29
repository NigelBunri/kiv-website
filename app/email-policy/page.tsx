import { SiteShell } from "@/components/SiteShell";

import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Email Policy", description: "How KIV prepares responsible transactional email.", path: "/email-policy" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Email Policy", href: "/email-policy" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Email Policy</h1>
          <p>How KIV prepares responsible transactional email.</p>
          <p>KIV sends transactional email only for requested or account-related actions once a provider is configured.</p>
<p>Emails should explain why the recipient received the message and how to ignore unrequested actions.</p>
<p>No purchased or scraped marketing lists are allowed.</p>
        </article>
      </section>

    </SiteShell>
  );
}
