import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kingdom Impact Ventures",
    short_name: "KIV",
    description: "Business and technology venture of KCAN.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf7",
    theme_color: "#1f1a12",
    icons: [
      { src: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Separate, padded artwork for maskable — the "any" icons above are
      // full-bleed and would lose the crown/wordmark if Android cropped
      // them to a circle or squircle under a maskable declaration.
      { src: "/images/kiv-logo-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/images/kiv-logo-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
