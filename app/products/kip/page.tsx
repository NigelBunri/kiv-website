import { FutureVentureProductPage } from "@/components/FutureVentureProductPage";
import { pageMetadata } from "@/lib/metadata";
import { productBySlug } from "@/lib/site";

const product = productBySlug("kip");

export const metadata = pageMetadata({
  title: product?.fullName ?? "Product",
  description: product?.summary ?? "KIV product page.",
  path: "/products/kip",
  image: { url: "/images/kip-venture-visual-1200.jpg", width: 1200, height: 675, alt: "KIP presented as a research-stage payments concept." },
});

export default function ProductPage() {
  return (
    <FutureVentureProductPage
      slug="kip"
      storyImage={{ src: "/images/kip-venture-visual.jpg", alt: "A research-stage payments concept with wallet, secure token, compliance gates, partner nodes and verification symbols." }}
      storyEyebrow="Research stage"
      storyTitle="Payments stay behind compliance and licensing review."
      storyBody="KIP is shown as future infrastructure only; the public site does not claim live processing, banking capability or payment licensing."
      storyPoints={[
        "Compliance gates come before any transaction workflow.",
        "No live payment movement is represented as available.",
        "Partner and identity requirements must be confirmed first.",
      ]}
      ventureDetailBody="KIP needs the strongest public boundaries because payment language can imply regulated capabilities if it is not carefully staged."
    />
  );
}
