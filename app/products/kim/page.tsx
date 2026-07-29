import { FutureVentureProductPage } from "@/components/FutureVentureProductPage";
import { pageMetadata } from "@/lib/metadata";
import { productBySlug } from "@/lib/site";

const product = productBySlug("kim");

export const metadata = pageMetadata({
  title: product?.fullName ?? "Product",
  description: product?.summary ?? "KIV product page.",
  path: "/products/kim",
  image: { url: "/images/kim-venture-visual-1200.jpg", width: 1200, height: 675, alt: "KIM presented as a planned marketplace venture." },
});

export default function ProductPage() {
  return (
    <FutureVentureProductPage
      slug="kim"
      storyImage={{ src: "/images/kim-venture-visual.jpg", alt: "A planned ethical marketplace ecosystem with vendor, product, customer, fulfilment and trust symbols." }}
      storyEyebrow="Future venture"
      storyTitle="Market is planned as trusted community commerce."
      storyBody="KIM is presented as a future marketplace concept for vendors, partners and KCAN communities, not as an active sales channel."
      storyPoints={[
        "Vendor and buyer workflows remain planned.",
        "No products, prices or live transactions are implied.",
        "Trust and fulfilment need review before launch claims.",
      ]}
      ventureDetailBody="KIM is explained as a planned marketplace direction while avoiding any suggestion of live commerce."
    />
  );
}
