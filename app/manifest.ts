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
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  };
}
