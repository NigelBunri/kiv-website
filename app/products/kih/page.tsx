import { FutureVentureProductPage } from "@/components/FutureVentureProductPage";
import { pageMetadata } from "@/lib/metadata";
import { productBySlug } from "@/lib/site";

const product = productBySlug("kih");

export const metadata = pageMetadata({
  title: product?.fullName ?? "Product",
  description: product?.summary ?? "KIV product page.",
  path: "/products/kih",
  image: { url: "/images/kih-venture-visual-1200.jpg", width: 1200, height: 675, alt: "KIH presented as a research-stage health-support concept." },
});

export default function ProductPage() {
  return (
    <FutureVentureProductPage
      slug="kih"
      storyImage={{ src: "/images/kih-venture-visual.jpg", alt: "A research-stage health-support concept with care coordination panels, privacy shield, support network nodes and partner care pods." }}
      storyEyebrow="Research stage"
      storyTitle="Health is framed as future care coordination support."
      storyBody="KIH remains a research-stage concept. The page avoids medical-service claims, diagnosis claims and clinical availability language."
      storyPoints={[
        "Care coordination requires partner and privacy review.",
        "No diagnosis, treatment or medical advice is implied.",
        "Any public workflow must pass compliance review first.",
      ]}
      ventureDetailBody="KIH is intentionally careful because health-related pages must avoid implying medical services or clinical advice."
    />
  );
}
