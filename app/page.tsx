import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs, CardGrid, ContactStrip, DetailList, FeatureGrid, HomeHero, ImageStory, ProductGrid, Section, Timeline } from "@/components/PageBlocks";
import { pageMetadata } from "@/lib/metadata";
import { audienceSegments, launchWorkflow, operatingModel, ventureTimeline } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Kingdom Impact Ventures",
  description: "Kingdom Impact Ventures (KIV) is KCAN's technology venture arm, building Kingdom-aligned products in education, marketplace, payments and community.",
  path: "/",
  image: { url: "/images/kiv-structure-visual-1200.jpg", width: 1200, height: 675, alt: "The structure connecting KCAN, KIV and its product portfolio." },
});

export default function HomePage() {
  return (
      <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }]} />
      <HomeHero />
      <Section title="What Kingdom Impact Ventures is">
        <p>
          Kingdom Impact Ventures (KIV) is the technology venture arm of KCAN - Kingdom Citizens &amp; Ambassadors Network. KIV designs, builds and operates Kingdom-aligned digital products: practical, accountable technology for real community, education, marketplace, payments and social-impact needs, not abstract mission statements.
        </p>
        <p>
          The first product is Kingdom Impact Social (KIS), a Christian digital ecosystem combining community, private communication and discipleship tools. Future ventures extend the same approach into education, marketplace, payments and health - each announced publicly only once it has real launch readiness behind it, never before.
        </p>
      </Section>
      <Section title="The product: Kingdom Impact Social" body="KIS is real today - in advanced launch preparation, not a future concept - and it's the fastest way to see what KIV actually builds.">
        <ImageStory
          src="/images/kis-ecosystem-visual.jpg"
          alt="KIS shown as a unified app ecosystem combining social feed, private messaging, Bible study, partner spaces and marketplace foundations."
          eyebrow="KIV's flagship product"
          title="One trusted app for community, private messaging, Bible study and partner spaces."
          body="KIS brings social connection, discipleship and partner operations into a single, purpose-built ecosystem rather than a generic social feed."
          points={[
            "Purpose-led profiles, groups and conversations built for KCAN communities.",
            "Bible and study workflows sit alongside social features as a first-class part of the app.",
            "Dedicated partner spaces for ministry teams, educators and marketplace leaders.",
          ]}
        />
        <FeatureGrid
          items={[
            { icon: "chat", title: "Social connection", body: "Purpose-led profiles, groups and conversations built with intention, not just scroll." },
            { icon: "broadcast", title: "Broadcast publishing", body: "Publish updates, teachings and announcements to exactly the people who need them." },
            { icon: "group", title: "Partner spaces", body: "Ministry teams, educators and marketplace leaders run their own communities inside KIS." },
            { icon: "book", title: "Bible & study workflows", body: "Structured study and discipleship tools sit alongside social features from day one." },
          ]}
        />
        <div className="action-row">
          <Link className="button primary" href="/products/kis">See everything KIS does <span aria-hidden="true">→</span></Link>
          <Link className="button secondary" href="/download">Check availability</Link>
        </div>
      </Section>
      <Section title="How the organisation fits together" body="The project is easier to understand when the public structure is kept explicit.">
        <DetailList items={operatingModel} />
      </Section>
      <Section title="Public hierarchy" body="The website keeps the organisation story consistent across every route.">
        <CardGrid
          items={[
            {
              title: "KCAN",
              body: "The parent organisation and mission body: Kingdom Citizens & Ambassadors Network.",
              image: { src: "/images/sm/kcan-logo-sm.png", alt: "KCAN" },
            },
            {
              title: "KIV",
              body: "The business and technology venture responsible for product development and venture operations.",
              image: { src: "/images/sm/kiv-logo-sm.png", alt: "Kingdom Impact Ventures" },
            },
            {
              title: "KIS",
              body: "The first flagship product, currently presented in advanced launch preparation.",
              image: { src: "/images/sm/kis-logo-sm.png", alt: "Kingdom Impact Social" },
            },
          ]}
        />
      </Section>
      <Section title="Venture portfolio" body="Every product page avoids unsupported launch, licensing, user-count or partner-logo claims.">
        <ProductGrid />
      </Section>
      <Section title="Who the ecosystem is designed to serve" body="The long-term vision is broad, but each public statement remains tied to current product stage and review status.">
        <CardGrid items={audienceSegments} />
      </Section>
      <Section title="Launch discipline" body="KIV presents progress through a controlled workflow so users understand what exists, what is planned and what still requires review.">
        <Timeline items={launchWorkflow} />
      </Section>
      <Section title="Portfolio sequence" body="The wider KCAN/KIV plan grows in stages instead of presenting every venture as ready on day one.">
        <Timeline items={ventureTimeline} />
      </Section>
      <Section title="Production readiness" body="Deployment work covers public trust, accessibility, search visibility, secure forms and operational documentation.">
        <CardGrid
          items={[
            { title: "Trust and safety", body: "Clear acceptable-use, child-safety, security, email and deletion policies are available before launch.", href: "/trust" },
            { title: "Responsible forms", body: "Public forms include validation, honeypot protection, submission rate limiting and honest delivery states.", href: "/contact" },
            { title: "Deployment handoff", body: "Vercel and AWS/self-hosted deployment paths are documented without changing any live server.", href: "/security" },
          ]}
        />
      </Section>
      <ContactStrip />
    </SiteShell>
  );
}
