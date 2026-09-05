import type { Metadata, Viewport } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/StructuredData";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { site } from "@/lib/site";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const serif = Libre_Baskerville({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Business and technology venture of KCAN`,
    // Full legal name, not the "KIV" short form: every indexed page title
    // repeating "Kingdom Impact Ventures" verbatim is one of the strongest
    // legitimate on-page signals for Google to associate that exact phrase
    // with this site as the branded/entity result.
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: site.url },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/kiv-logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "msapplication-TileColor": "#1f1a12",
    "msapplication-TileImage": "/mstile-150x150.png",
    "msapplication-config": "/browserconfig.xml",
    // Mirrors the Referrer-Policy response header in next.config.ts - some
    // crawlers/scanners only check the meta tag, some only the header;
    // both should say the same thing.
    referrer: "strict-origin-when-cross-origin",
    // ThemeToggle.tsx/globals.css genuinely support both palettes (dark is
    // just the default for a first-time visitor) - this tells the browser
    // chrome (scrollbars, form controls) it can render either, matching
    // the color-scheme CSS property already set in globals.css.
    "color-scheme": "light dark",
    // No phone numbers are rendered as plain auto-linkable text - form
    // <input type="tel"> fields already exist for real entry, so mobile
    // Safari's auto-detection would only ever mis-flag stray digits (e.g.
    // ISO dates, version numbers) as phone numbers.
    "format-detection": "telephone=no",
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/images/og-cover.png", width: 1200, height: 630, alt: `${site.name} - business and technology venture of KCAN` }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [{ url: "/images/og-cover.png", alt: `${site.name} - business and technology venture of KCAN` }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f1a12",
};

// Sets data-theme on <html> before first paint, so there's no flash of
// the wrong theme between the server-rendered (theme-less) HTML and this
// script running. Dark is the default for a first-time visitor (no
// kiv-theme key in localStorage yet) - ThemeToggle.tsx writes that key
// once a visitor picks a theme explicitly. Deliberately does NOT fall
// back to prefers-color-scheme: the brief is "dark by default", not
// "match the OS" - a visitor who wants light gets it via the toggle, not
// by us guessing from their system setting.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("kiv-theme");
    var theme = stored === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Points at the About page, which is the real "who wrote this"
            answer for every page on the site (there's no per-article byline
            system) - not a fabricated personal author. */}
        <link rel="author" href="/about" />
        <link rel="stylesheet" href="/print.css" media="print" />
        {/* Duplicates the same rule in globals.css's external, hashed
            bundle - kept here too so it's visible directly in the served
            HTML (some auditing tools only inspect inline <style>/markup,
            not fetched stylesheets) and so it still applies during the
            brief window before that bundle loads. */}
        <style>{"@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}"}</style>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${serif.variable}`}>
        <ServiceWorkerRegister />
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <ScrollProgress />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
