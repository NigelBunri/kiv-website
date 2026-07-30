import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { AvailabilityPanel, Breadcrumbs, CardGrid, DetailList, Hero, ImageStory, Section, Timeline } from "@/components/PageBlocks";
import { ProductJsonLd } from "@/components/StructuredData";
import { launchWorkflow, productBySlug, productDeepDives } from "@/lib/site";

const readinessTitles = ["What the site claims today", "What must happen first"];

type FutureVentureSlug = "kie" | "kim" | "kip" | "kih";

/**
 * Shared body for KIE/KIM/KIP/KIH — the four planned/research-stage
 * ventures that intentionally share one structure (Hero, story, readiness
 * cards, deep-dive detail, shared launch-discipline timeline,
 * availability). KIS is deliberately NOT built on this: it's a real,
 * shipping product with its own bespoke feature breakdown, so folding it
 * into this shared shape would either strip its real content down to this
 * template's level or force fields this template doesn't need.
 */
export function FutureVentureProductPage({
  slug,
  storyImage,
  storyEyebrow,
  storyTitle,
  storyBody,
  storyPoints,
  ventureDetailBody,
}: {
  slug: FutureVentureSlug;
  storyImage: { src: string; alt: string };
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;
  storyPoints: string[];
  ventureDetailBody: string;
}) {
  const product = productBySlug(slug);
  if (!product) notFound();

  return (
    <SiteShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Products", href: "/products" }, { name: product.name, href: `/products/${slug}` }]} />
      <ProductJsonLd product={product} />
      <Hero
        eyebrow={product.statusLabel}
        title={product.fullName}
        body={product.summary}
        actions={[{ href: "/download", label: "Availability", variant: "primary" }, { href: "/contact", label: "Contact KIV" }]}
        logo={{ src: `/images/${slug}-logo.png`, alt: product.fullName }}
      />
      <ImageStory
        src={storyImage.src}
        alt={storyImage.alt}
        eyebrow={storyEyebrow}
        title={storyTitle}
        body={storyBody}
        points={storyPoints}
      />
      <Section title="Who this is for" body={product.audience}>
        <CardGrid items={product.details.map((body, index) => ({ title: readinessTitles[index] ?? "Additional note", body }))} />
      </Section>
      <Section title="Venture detail" body={ventureDetailBody}>
        <DetailList items={productDeepDives[slug]} />
      </Section>
      <Section title="Launch-readiness path" body={`The same launch discipline KIV applies across every venture governs when ${product.name}'s public claims can expand.`}>
        <Timeline items={launchWorkflow} />
      </Section>
      <AvailabilityPanel product={product} />
    </SiteShell>
  );
}
