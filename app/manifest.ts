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
      { src: "/images/kiv-logo-256.png", sizes: "256x256", type: "image/png" },
      { src: "/images/kiv-logo-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
