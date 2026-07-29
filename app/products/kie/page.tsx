import { FutureVentureProductPage } from "@/components/FutureVentureProductPage";
import { pageMetadata } from "@/lib/metadata";
import { productBySlug } from "@/lib/site";

const product = productBySlug("kie");

export const metadata = pageMetadata({
  title: product?.fullName ?? "Product",
  description: product?.summary ?? "KIV product page.",
  path: "/products/kie",
  image: { url: "/images/kie-venture-visual-1200.jpg", width: 1200, height: 675, alt: "KIE presented as a planned education and formation venture." },
});

export default function ProductPage() {
  return (
    <FutureVentureProductPage
      slug="kie"
      storyImage={{ src: "/images/kie-venture-visual.jpg", alt: "A planned education ecosystem with learning pathways, cohorts, books, a tablet and institution symbols." }}
      storyEyebrow="Future venture"
      storyTitle="Education is planned as a structured formation pathway."
      storyBody="KIE is shown as a future learning ecosystem, not as an open institution or live course catalogue."
      storyPoints={[
        "Learning pathways and cohorts require formal review.",
        "Institution and accreditation details are not claimed here.",
        "Public availability remains disabled until readiness is confirmed.",
      ]}
      ventureDetailBody="KIE has a clear direction, but public claims remain limited until programme and operational readiness are reviewed."
    />
  );
}
