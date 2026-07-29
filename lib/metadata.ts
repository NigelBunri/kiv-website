import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

type MetaInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
};

export function pageMetadata({ title, description, path, type = "website" }: MetaInput): Metadata {
  const fullTitle = title === site.name ? title : `${title} | ${site.shortName}`;
  const url = absoluteUrl(path);
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.name,
      type,
      images: [{ url: "/og.svg", width: 1200, height: 630, alt: `${site.name} social preview` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/og.svg"],
    },
  };
}
