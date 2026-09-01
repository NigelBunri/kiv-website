import { SiteShell } from "@/components/SiteShell";
import { PublicForm } from "@/components/PublicForm";
import { Breadcrumbs, CardGrid, DetailList, ImageStory, Section } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "Account Deletion", description: "Request account deletion help without sharing credentials.", path: "/account-deletion" });

export default function Page() {
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Account Deletion", href: "/account-deletion" }]} />
      <section className="content-page">
        <article>
          <p className="eyebrow">Policy</p>
          <h1>Account Deletion</h1>
          <p>Account deletion requests should begin through the deletion form or support route without sharing passwords, one-time codes, private recovery details or unnecessary personal records.</p>
          <p>KIV must verify account ownership before making account changes. This protects users from unauthorized deletion attempts and gives the team enough context to locate the right product or public-site records.</p>
          <p>If KIS account systems are not yet publicly available for a visitor, the deletion request may be handled as a readiness or launch-list enquiry rather than a live product account deletion.</p>
          <p>Some records may need to be retained for legal, security, abuse-prevention, dispute, audit or operational reasons. Those exceptions should be reviewed before production launch.</p>
        </article>
      </section>
      <ImageStory
        src="/images/kiv-contact-workflows-visual.jpg"
        alt="A request-routing visual showing account deletion moving through verification and support review."
        eyebrow="Deletion workflow"
        title="Deletion starts with verification, not credentials."
        body="The safest deletion request gives KIV enough context to find the record while protecting private account secrets."
        points={[
          "Identify the email or account context you believe is connected to KIV/KIS.",
          "Do not include passwords, recovery phrases, private messages or one-time codes.",
          "Expect follow-up if ownership or record location needs verification.",
        ]}
      />
      <Section title="Before submitting">
        <CardGrid
          items={[
            { title: "Use the right email", body: "Submit from an address connected to the request when possible so ownership can be reviewed more quickly." },
            { title: "Describe the product area", body: "Mention whether the request relates to KIS, the launch list, a public form, a partner enquiry or another route." },
            { title: "Avoid secret data", body: "Never send passwords, one-time codes, recovery words, payment details or private credentials." },
            { title: "Understand retention", body: "Security, legal, dispute and audit records may require limited retention even after deletion is requested." },
          ]}
        />
      </Section>
      <Section title="What happens when you delete your account" body="Drafted terms, pending legal review.">
        <DetailList
          items={[
            { title: "Verification first", body: "We confirm you own the account before making changes, without ever asking for your password through the deletion form." },
            { title: "What's removed", body: "Profile information, messages and content tied to your account are deleted or anonymised within a reasonable period after verification." },
            { title: "What may be retained", body: "Records required for legal, security, fraud-prevention or dispute purposes may be retained for a limited period, as described in our Privacy Policy." },
            { title: "Timeline", body: "Once verified, a deletion request starts a grace period of up to 30 days before permanent removal, rather than an instant, irreversible action. This window exists so a request made in error, or under duress, can still be reversed." },
            { title: "Reactivation window", body: "If you change your mind during the grace period, you can reactivate the account and cancel the deletion instead of losing everything immediately." },
            { title: "Irreversibility", body: "Once the grace period elapses and deletion is processed, it cannot be undone, and associated chat messages are purged as part of the same process. Export anything you want to keep first, once export tools are available." },
          ]}
        />
      </Section>

      <section className="section">
        <div className="section-heading"><h2>Submit a request</h2><p>Use this form only for account-deletion help and never include passwords or private credentials.</p></div>
        <PublicForm kind="deletion" subject="Account Deletion request" />
      </section>
    </SiteShell>
  );
}
