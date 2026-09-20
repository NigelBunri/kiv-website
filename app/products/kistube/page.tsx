import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { AvailabilityPanel, Breadcrumbs, CardGrid, Hero, ImageStory, Section } from "@/components/PageBlocks";
import { ProductJsonLd } from "@/components/StructuredData";
import { pageMetadata } from "@/lib/metadata";
import { productBySlug } from "@/lib/site";

const product = productBySlug("kistube");

export const metadata = pageMetadata({
  title: product?.fullName ?? "Product",
  description: product?.summary ?? "KIV product page.",
  path: "/products/kistube",
  image: { url: "/images/kistube-visual-1200.jpg", width: 1200, height: 675, alt: "KISTube, the video and content platform for KIS." },
});

export default function ProductPage() {
  if (!product) notFound();
  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Products", href: "/products" }, { name: product.name, href: "/products/kistube" }]} />
      <ProductJsonLd product={product} />
      <Hero
        eyebrow={`${product.statusLabel} · part of the KIS ecosystem`}
        title={product.fullName}
        body={product.summary}
        actions={[{ href: "/contact", label: "Contact KIV" }]}
        logo={{ src: "/images/kistube-logo.png", alt: product.fullName }}
      />
      <ImageStory
        src="/images/kistube-visual.jpg"
        alt="The KISTube wordmark and play-button crest, the video and content home for KIS."
        eyebrow="Where to find it"
        title="A real, working part of KIS you can open right now."
        body="Unlike most of the KIS ecosystem, which stays deliberately careful about implying a broad public launch, KISTube runs today as its own standalone site."
        points={[
          "Channels, broadcasts and testimonies from partners and creators.",
          "Education, health, market and jobs content from across the KIS ecosystem.",
          "Its own deployment at kistube.kingdomimpactventures.org, kept separate from the rest of this site.",
        ]}
      />
      <Section title="Who this is for" body={product.audience}>
        <CardGrid
          items={[
            { title: "What you can do there", body: product.details[0] },
            { title: "How it's deployed", body: product.details[1] },
            { title: "Where it stands today", body: product.details[2] },
          ]}
        />
      </Section>
      <AvailabilityPanel product={product} />
    </SiteShell>
  );
}
