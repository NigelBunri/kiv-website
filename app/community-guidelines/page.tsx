import { CardGrid, DetailList, Section } from "@/components/PageBlocks";
import { SiteShell } from "@/components/SiteShell";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Community Guidelines", description: "Community expectations for KIV and KIS public communication.", path: "/community-guidelines" });

export default function Page() {
  return (
    <SiteShell>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Community Guidelines", href: "/community-guidelines" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Community Guidelines</h1>
          <p>KIV and KIS public communication should protect dignity, safety, truthfulness and lawful use. The product vision is community-first, but community tools must be governed before they are opened widely.</p>
          <p>Participants should communicate honestly, avoid harassment and exploitation, respect privacy, avoid impersonation, and report issues through the appropriate route instead of escalating harm publicly.</p>
          <p>KIS product communities will require in-product rules for profiles, messaging, groups, broadcasts, partner spaces, events, Bible/study areas, marketplace foundations and reporting workflows before broad public launch.</p>
          <p>These guidelines are public readiness content. They explain the direction of the community standard and do not replace the final moderation, safety or legal policy that should govern live product communities.</p>
        </article>
      </section>
      <Section title="Community principles">
        <CardGrid
          items={[
            { title: "Dignity", body: "Treat people, churches, ministries, partners and communities with care, even when raising disagreement or concern." },
            { title: "Truthfulness", body: "Avoid false claims, impersonation, fake endorsements, misleading testimony or unsupported product statements." },
            { title: "Safety", body: "Do not share private credentials, exploit vulnerable users, target children, publish abuse material or encourage harm." },
            { title: "Accountability", body: "Use reporting and support routes when something needs review, and expect moderation rules before live community operation." },
          ]}
        />
      </Section>
      <Section title="Community standards" body="Drafted terms, pending legal review.">
        <DetailList
          items={[
            { title: "Respectful dialogue", body: "Disagreement, including on matters of faith and theology, should stay respectful. Personal attacks and harassment are not tolerated." },
            { title: "Authentic participation", body: "No fake accounts, coordinated inauthentic behaviour, or impersonation of ministries, partners or institutions." },
            { title: "Safe spaces for all ages", body: "Content shared in shared KIS community spaces must be appropriate for the general KCAN community audience, including families." },
            { title: "Partner and institution conduct", body: "Organisations operating spaces within KIS are responsible for moderating their own communities consistent with these guidelines." },
            { title: "Reporting and moderation", body: "Use in-product reporting tools, once live, or the /contact route to flag concerning content. Reports are reviewed and may lead to content removal, feature restrictions, or account suspension." },
            { title: "Consequences", body: "Guideline violations may result in content removal, warnings, temporary restrictions, or permanent removal from KIS communities." },
          ]}
        />
      </Section>

    </SiteShell>
  );
}
