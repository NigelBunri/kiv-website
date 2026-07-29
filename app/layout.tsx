import type { Metadata, Viewport } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import { CriticalStyles } from "@/components/CriticalStyles";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/StructuredData";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ScrollProgress } from "@/components/ScrollProgress";
import { site } from "@/lib/site";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const serif = Libre_Baskerville({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Business and technology venture of KCAN`,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: site.url },
  icons: {
    icon: [
      { url: "/images/kiv-logo-256.png", sizes: "256x256", type: "image/png" },
      { url: "/images/kiv-logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/images/kiv-logo-256.png",
    apple: "/images/kiv-logo-256.png",
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/images/kiv-logo.png", width: 512, height: 512, alt: `${site.name} social preview` }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: ["/images/kiv-logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f1a12",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${serif.variable}`}>
        <CriticalStyles />
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <ScrollProgress />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
