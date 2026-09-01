import { Breadcrumbs, CardGrid, DetailList, ImageStory, Section } from "@/components/PageBlocks";
import { SiteShell } from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Child Safety", description: "Child-safety expectations for KIV and future KIS community features.", path: "/child-safety" });

export default function Page() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Child Safety", href: "/child-safety" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Child Safety</h1>
          <p>Child safety is treated as a launch-critical responsibility for KIV and future KIS community features. Public pages should not invite children to submit private credentials, sensitive personal information or private account details.</p>
          <p>KIS features that involve profiles, messaging, groups, partner communities, events, education content or mentor-style workflows require age-appropriate review, reporting paths, moderation expectations and escalation procedures before wide public use.</p>
          <p>Safety language must stay practical and honest. KIV should not claim mature child-safety operations until the relevant product workflows, moderation coverage, support process and legal review are verified.</p>
        </article>
      </section>
      <ImageStory
        src="/images/kiv-trust-security-visual.jpg"
        alt="A trust and safety operations visual with protected user pathways and review checkpoints."
        eyebrow="Safety posture"
        title="Public pages stay cautious until live safety workflows are verified."
        body="The website can explain the intended child-safety standard while keeping final enforcement and moderation claims tied to product readiness."
        points={[
          "Do not collect credentials or unnecessary sensitive records through public pages.",
          "Require reporting, moderation and escalation review before live community release.",
          "Keep partner, education and mentor workflows under extra review where children may be involved.",
        ]}
      />
      <Section title="Child-safety review areas">
        <CardGrid
          items={[
            { title: "Profiles and identity", body: "Age, visibility, guardian, institution and identity expectations must be reviewed before public account flows." },
            { title: "Messaging and groups", body: "Private communication requires reporting, blocking, moderation and escalation planning before broad availability." },
            { title: "Education and mentoring", body: "Learning and mentor workflows need clear roles, safeguarding expectations and partner responsibilities." },
            { title: "Events and partners", body: "Partner-led activities must clarify accountability, consent, attendance and reporting responsibilities." },
          ]}
        />
      </Section>
      <Section title="Our commitments" body="Drafted terms, pending legal review.">
        <DetailList
          items={[
            { title: "Minimum age", body: "KIS is intended for users aged 13 and older, or the minimum digital-consent age in your country if higher. Age checks are enforced wherever a date of birth is collected at signup; mandatory age verification for every new account is being rolled out and is not yet complete, so this is a stated policy backed by partial technical enforcement today, not a guarantee that every underage registration is caught." },
            { title: "Zero tolerance", body: "Child sexual abuse material or grooming behaviour of any kind is prohibited absolutely. Suspected material is reported to the National Center for Missing & Exploited Children (NCMEC) or the applicable local authority, and to law enforcement." },
            { title: "Reporting", body: `Anyone can report a child-safety concern via /contact or ${site.securityEmail}. Reports involving child safety are treated as urgent.` },
            { title: "Product safeguards", body: "Messaging, groups, and partner or education spaces involving minors require age-appropriate design, reporting tools, and moderation review before general availability. A server-enforced daily time limit on browsing feeds is already built to reduce open-ended, addictive scrolling for all users, including minors." },
            { title: "Parental involvement", body: "Where required by law, we will implement parental consent or notice mechanisms for younger users. Guardian-managed family accounts, where only a designated guardian can change a minor's parental-control settings, already exist as a product capability ahead of wider rollout." },
            { title: "Law enforcement cooperation", body: "We cooperate with law enforcement investigations into child exploitation to the extent required and permitted by law." },
          ]}
        />
      </Section>

    </SiteShell>
  );
}
