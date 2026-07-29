export const site = {
  name: "Kingdom Impact Ventures",
  shortName: "KIV",
  parentName: "KCAN, Kingdom Citizens & Ambassadors Network",
  domain: "kingdomimpactventures.org",
  url: "https://kingdomimpactventures.org",
  description:
    "Kingdom Impact Ventures builds practical technology ventures for KCAN, beginning with Kingdom Impact Social and extending into future education, media, payments and health products.",
  supportEmail: "support@kingdomimpactventures.org",
  securityEmail: "security@kingdomimpactventures.org",
  legalEmail: "legal@kingdomimpactventures.org",
} as const;

export type ProductStage = "advanced-launch-preparation" | "planned" | "research";

export type Product = {
  slug: string;
  name: string;
  fullName: string;
  stage: ProductStage;
  statusLabel: string;
  summary: string;
  audience: string;
  details: string[];
  availability: {
    android: boolean;
    ios: boolean;
    web: boolean;
    launchList: boolean;
    googlePlayUrl?: string;
    appStoreUrl?: string;
    webAppUrl?: string;
  };
};

export const products: Product[] = [
  {
    slug: "kis",
    name: "KIS",
    fullName: "Kingdom Impact Social",
    stage: "advanced-launch-preparation",
    statusLabel: "Advanced launch preparation",
    summary:
      "KIS is the first flagship product from KIV: a purpose-led social, partner and discipleship platform for KCAN communities.",
    audience: "KCAN members, ministry teams, partners, educators, marketplace leaders and invited early users.",
    details: [
      "Social connection, broadcast publishing, partner spaces, Bible and study workflows, and marketplace foundations.",
      "Configured availability controls determine whether launch-list, Android, iOS or web actions appear.",
      "Public copy intentionally avoids claiming active store availability until official links are configured.",
    ],
    availability: {
      android: process.env.NEXT_PUBLIC_KIS_ANDROID_AVAILABLE === "true",
      ios: process.env.NEXT_PUBLIC_KIS_IOS_AVAILABLE === "true",
      web: Boolean(process.env.NEXT_PUBLIC_KIS_WEB_APP_URL),
      launchList: process.env.NEXT_PUBLIC_KIS_LAUNCH_LIST !== "false",
      googlePlayUrl: process.env.NEXT_PUBLIC_KIS_GOOGLE_PLAY_URL,
      appStoreUrl: process.env.NEXT_PUBLIC_KIS_APP_STORE_URL,
      webAppUrl: process.env.NEXT_PUBLIC_KIS_WEB_APP_URL,
    },
  },
  {
    slug: "kie",
    name: "KIE",
    fullName: "Kingdom Impact Education",
    stage: "planned",
    statusLabel: "Planned venture",
    summary:
      "KIE is planned as a structured education and formation product for learning pathways, cohorts and partner-led programmes.",
    audience: "Learners, mentors, training teams and partner institutions.",
    details: [
      "The public site presents KIE as a future venture, not a launched product.",
      "Programme, cohort and certification details require formal review before public publication.",
    ],
    availability: { android: false, ios: false, web: false, launchList: false },
  },
  {
    slug: "kim",
    name: "KIM",
    fullName: "Kingdom Impact Media",
    stage: "planned",
    statusLabel: "Planned venture",
    summary:
      "KIM is planned for media distribution, publishing operations and content workflows connected to KCAN's wider mission.",
    audience: "Publishers, ministries, creators and communications teams.",
    details: [
      "No public user counts, licensing claims or release dates are stated.",
      "Media workflows will be announced only after product and legal readiness.",
    ],
    availability: { android: false, ios: false, web: false, launchList: false },
  },
  {
    slug: "kip",
    name: "KIP",
    fullName: "Kingdom Impact Payments",
    stage: "research",
    statusLabel: "Research and compliance review",
    summary:
      "KIP is a future payments and support infrastructure concept that remains subject to compliance, banking and legal review.",
    audience: "KCAN operations, partners and verified payment participants.",
    details: [
      "The site does not claim payment licensing, financial product availability or live processing.",
      "Any public payment capability must complete compliance review before launch.",
    ],
    availability: { android: false, ios: false, web: false, launchList: false },
  },
  {
    slug: "kih",
    name: "KIH",
    fullName: "Kingdom Impact Health",
    stage: "research",
    statusLabel: "Research and partner discovery",
    summary:
      "KIH is a future health-support concept for partner-led care coordination and operational support.",
    audience: "Health partners, care teams and community support coordinators.",
    details: [
      "The website avoids medical-service claims, clinical advice and regulatory assertions.",
      "Any health workflows will require partner, privacy and compliance review before release.",
    ],
    availability: { android: false, ios: false, web: false, launchList: false },
  },
];

export const nav = [
  { href: "/about", label: "About" },
  { href: "/mission", label: "Mission" },
  { href: "/products", label: "Products" },
  { href: "/partners", label: "Partners" },
  { href: "/investors", label: "Investors" },
  { href: "/updates", label: "Updates" },
  { href: "/contact", label: "Contact" },
];

export const utilityRoutes = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/acceptable-use", label: "Acceptable Use" },
  { href: "/community-guidelines", label: "Community Guidelines" },
  { href: "/security", label: "Security" },
  { href: "/trust", label: "Trust" },
  { href: "/cookies", label: "Cookies" },
  { href: "/child-safety", label: "Child Safety" },
  { href: "/email-policy", label: "Email Policy" },
  { href: "/account-deletion", label: "Account Deletion" },
  { href: "/data-deletion", label: "Data Deletion" },
];

export type Update = {
  slug: string;
  title: string;
  description: string;
  date: string;
  sections: string[];
};

export const updates: Update[] = [
  {
    slug: "kiv-production-website-readiness",
    title: "KIV prepares public website for production launch",
    description:
      "A short update on the public website, product availability controls and responsible launch preparation.",
    date: "2026-07-29",
    sections: [
      "KIV is preparing its public website for the kingdomimpactventures.org deployment. The work focuses on clear public information, security-conscious forms, route coverage, SEO, accessibility and deployment readiness.",
      "KIS remains the first flagship product. Store links and web-app actions are controlled by configuration so the website does not imply availability before official launch assets are ready.",
      "Future ventures under KIV are described as planned or research-stage products until their public launch status changes through reviewed configuration and content updates.",
    ],
  },
  {
    slug: "kis-launch-preparation",
    title: "KIS remains in advanced launch preparation",
    description:
      "How the KIV website presents KIS honestly while keeping app availability configurable.",
    date: "2026-07-29",
    sections: [
      "Kingdom Impact Social is presented as a real flagship product in advanced launch preparation, not as a fully public app unless official distribution links are configured.",
      "The download page supports coming-soon, Android, iOS and web states without fake links or automatic redirects.",
    ],
  },
];

export const supportArticles = [
  {
    slug: "contact-and-response-times",
    title: "Contact and response times",
    description: "How KIV handles public contact, partner and support requests.",
    body: [
      "Public forms route requests to the configured server-side provider. If no provider is configured, the website records a clear development-safe response instead of pretending that delivery occurred.",
      "Urgent security reports should use the security reporting form or the published security contact address.",
    ],
  },
  {
    slug: "account-and-data-requests",
    title: "Account and data requests",
    description: "Where to begin account deletion and data deletion requests.",
    body: [
      "Account and data deletion pages explain what information is needed and what KIV must verify before actioning a request.",
      "The public website does not collect passwords, recovery codes or private credentials for deletion requests.",
    ],
  },
];

export function productBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function updateBySlug(slug: string) {
  return updates.find((update) => update.slug === slug);
}

export function supportBySlug(slug: string) {
  return supportArticles.find((article) => article.slug === slug);
}

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
