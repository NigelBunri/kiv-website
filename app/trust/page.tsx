import { SiteShell } from "@/components/SiteShell";

import { CardGrid, DetailList, ImageStory, Section } from "@/components/PageBlocks";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { launchWorkflow, trustSafeguards } from "@/lib/site";

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
          <p>KIV separates verified facts from planned work so visitors can understand what is available, what is being prepared and what still requires review.</p>
          <p>Destructive, financial, health, credential, child-safety and partner-claim workflows require specific review before stronger public claims are made.</p>
          <p>Public forms explain delivery behavior, avoid collecting secrets and provide honest responses when production delivery providers are not configured.</p>
        </article>
      </section>
      <ImageStory
        src="/images/kiv-trust-security-visual.jpg"
        alt="A protected trust hub showing safety, privacy, secure forms, reviewed gates and family-safe safeguards."
        eyebrow="Trust model"
        title="Trust is built through clear boundaries, not inflated claims."
        body="The public website is designed to make the project understandable while keeping sensitive or regulated areas behind review gates."
        points={[
          "Verified facts are separated from future-stage work.",
          "Forms avoid secrets and route requests safely.",
          "Product availability is controlled by configuration.",
        ]}
      />
      <Section title="Trust safeguards" body="These are the public rules that keep KIV communication responsible.">
        <DetailList items={trustSafeguards} />
      </Section>
      <Section title="Launch review path" body="The trust posture is connected to the same controlled launch process used across the product pages.">
        <CardGrid items={launchWorkflow} />
      </Section>
    </SiteShell>
  );
}
