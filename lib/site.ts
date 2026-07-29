export const site = {
  name: "Kingdom Impact Ventures",
  shortName: "KIV",
  parentName: "KCAN, Kingdom Citizens & Ambassadors Network",
  domain: "kingdomimpactventures.org",
  url: "https://kingdomimpactventures.org",
  description:
    "Kingdom Impact Ventures builds practical technology ventures for KCAN, beginning with Kingdom Impact Social and extending into future education, market, payments and health products.",
  supportEmail: "support@kingdomimpactventures.org",
  securityEmail: "security@kingdomimpactventures.org",
  legalEmail: "legal@kingdomimpactventures.org",
  // Public by design (a CAPTCHA site key is meant to ship to the browser —
  // the secret half stays server-only as TURNSTILE_SECRET_KEY, never
  // exposed here). Empty string when unset so PublicForm can render
  // without the widget in local dev rather than breaking the form.
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
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

export const operatingModel = [
  {
    title: "KCAN",
    body:
      "KCAN is the parent mission body: Kingdom Citizens & Ambassadors Network. It carries the purpose, values and wider community vision that the ventures are designed to serve.",
  },
  {
    title: "KIV",
    body:
      "KIV is the business and technology venture arm. It turns KCAN-aligned needs into products, operating plans, partner workflows, launch controls and public communication.",
  },
  {
    title: "KIS",
    body:
      "KIS is the first flagship product. It brings social connection, private communication, partner spaces, Bible/study workflows and marketplace foundations into one trusted app ecosystem.",
  },
  {
    title: "Future ventures",
    body:
      "KIE, KIM, KIP and KIH are presented as planned or research-stage ventures until their own readiness, compliance and operating requirements are confirmed.",
  },
];

export const kisModules = [
  {
    title: "Profiles, feed and community discovery",
    body:
      "KIS is designed to let members build purpose-led profiles, discover aligned communities, follow trusted updates and participate without the public site claiming a broad public launch.",
  },
  {
    title: "Messaging and group conversations",
    body:
      "Private and group communication are core to the product vision, with safety, privacy and operational readiness treated as launch-critical responsibilities.",
  },
  {
    title: "Channels, broadcasts and partner pages",
    body:
      "Organizations, ministries, creators and partner teams can be represented through channels or partner spaces once the product and governance model are ready.",
  },
  {
    title: "Bible, study and discipleship workflows",
    body:
      "Faith formation is not an afterthought. Bible reading, study progress, teaching content and mentoring concepts are part of the product architecture.",
  },
  {
    title: "Events and community operations",
    body:
      "KIS is expected to support coordination around gatherings, announcements, reminders and partner-led activities as the platform matures.",
  },
  {
    title: "Marketplace foundations",
    body:
      "Commerce concepts are acknowledged as foundations only. Public marketplace claims remain staged until vendor, fulfilment, payment and trust requirements are reviewed.",
  },
];

export const audienceSegments = [
  {
    title: "Individuals and families",
    body:
      "People looking for safer, more purposeful digital community, communication and faith-growth tools.",
  },
  {
    title: "Churches and ministries",
    body:
      "Teams that need member communication, broadcasts, events, group coordination and trusted public presence.",
  },
  {
    title: "Creators and teachers",
    body:
      "Educators, mentors and Christian creators who need structured content, channels and audience relationships.",
  },
  {
    title: "Schools and training partners",
    body:
      "Education partners who may align with KIE and KIS learning workflows after formal programme review.",
  },
  {
    title: "Marketplace and service partners",
    body:
      "Vendors, entrepreneurs and local organizations who may later participate in commerce or service-delivery workflows.",
  },
  {
    title: "Care and support partners",
    body:
      "Organizations involved in care coordination or support operations, subject to privacy and compliance review.",
  },
];

export const launchWorkflow = [
  {
    title: "1. Define the real workflow",
    body:
      "The team identifies what users, partners or communities actually need before presenting a feature as public capability.",
  },
  {
    title: "2. Confirm safety and governance",
    body:
      "Privacy, moderation, child safety, security, legal and operational requirements are reviewed before public launch language is used.",
  },
  {
    title: "3. Configure availability",
    body:
      "Download, Android, iOS, web-app and launch-list states are controlled by environment configuration so the site does not show fake release links.",
  },
  {
    title: "4. Gather evidence",
    body:
      "Partner, investor and operational conversations can request product, legal, infrastructure and readiness evidence through the proper workflow.",
  },
  {
    title: "5. Publish carefully",
    body:
      "Public pages are updated only when claims can be supported by reviewed assets, official links and confirmed operating readiness.",
  },
];

export const trustSafeguards = [
  {
    title: "Truthful launch posture",
    body:
      "The site avoids fake users, fake revenue, fake awards, fake partner logos, fake store badges and claims that imply release before official configuration.",
  },
  {
    title: "Safe public forms",
    body:
      "Forms use validation, honeypot protection, CAPTCHA support and clear warnings not to submit passwords, recovery codes or confidential credentials.",
  },
  {
    title: "Security-first website delivery",
    body:
      "The site ships security headers, controlled form handling, provider scaffolding and documented deployment requirements for production review.",
  },
  {
    title: "Privacy and deletion readiness",
    body:
      "Privacy, account deletion and data deletion pages explain the basic request path while keeping legal review and identity verification requirements visible.",
  },
  {
    title: "Stage-aware product copy",
    body:
      "KIS can be described as advanced launch preparation. KIE, KIM, KIP and KIH remain planned or research-stage until readiness changes.",
  },
  {
    title: "Human review where risk is high",
    body:
      "Payments, health, child safety, moderation, partner claims, legal copy and investor materials require direct review before stronger public statements.",
  },
];

export const ventureTimeline = [
  {
    title: "Phase 1: KIS foundation",
    body:
      "The first public priority is KIS: a trusted social, partner and discipleship platform for KCAN communities in advanced launch preparation.",
  },
  {
    title: "Phase 2: Education pathways",
    body:
      "KIE is planned to support structured learning, cohorts, mentoring and partner-led programmes after formal educational review.",
  },
  {
    title: "Phase 3: Market and payments",
    body:
      "KIM and KIP are staged behind commerce, fulfilment, payment, compliance and trust requirements before any public operational claims.",
  },
  {
    title: "Phase 4: Health-support coordination",
    body:
      "KIH remains research-stage and must avoid medical-service claims until qualified partners, privacy review and compliance requirements are clear.",
  },
];

export const productDeepDives: Record<string, Array<{ title: string; body: string }>> = {
  kis: [
    {
      title: "Why KIS comes first",
      body:
        "The KIS platform is the practical starting point because community, communication, identity, partner spaces and discipleship workflows create the foundation other KCAN-aligned ventures can build on.",
    },
    {
      title: "How the product is positioned",
      body:
        "KIS is positioned as a trusted Christian digital ecosystem, not a generic social app. It combines social connection with spiritual growth, private communication, partner operations and future commerce foundations.",
    },
    {
      title: "What remains launch-critical",
      body:
        "Production hardening, provider integrations, moderation, notifications, analytics, payment readiness and operational support must be reviewed before broader public availability claims are made.",
    },
    {
      title: "What the website will not claim yet",
      body:
        "The public site does not claim live app-store release, public user counts, verified partner logos, payment processing, medical services or guaranteed availability until those facts are configured and reviewed.",
    },
  ],
  kie: [
    {
      title: "Purpose",
      body:
        "KIE is planned to support purpose-driven learning, formation pathways, cohorts and partner-led programmes that can serve students, mentors, training teams and institutions.",
    },
    {
      title: "Possible workflows",
      body:
        "Future workflows may include course discovery, cohort management, mentor notes, lesson progress, learning resources, institutional dashboards and partner programme coordination.",
    },
    {
      title: "Readiness requirements",
      body:
        "Curriculum, accreditation language, institution structure, staff responsibilities, learner data handling and programme outcomes require formal review before stronger claims are published.",
    },
    {
      title: "Public boundary",
      body:
        "The site presents KIE as planned. It does not claim open admissions, certifications, degrees, active cohorts or a public learning platform.",
    },
  ],
  kim: [
    {
      title: "Purpose",
      body:
        "KIM is planned as a trusted marketplace direction for KCAN-aligned vendors, partners, entrepreneurs and communities who may need commerce, discovery and fulfilment workflows.",
    },
    {
      title: "Possible workflows",
      body:
        "Future workflows may include vendor profiles, product listings, partner verification, order discovery, fulfilment coordination, reviews and marketplace trust controls.",
    },
    {
      title: "Readiness requirements",
      body:
        "Vendor onboarding, product standards, fulfilment, buyer protection, refunds, payments, dispute handling and local regulations must be confirmed before launch language is expanded.",
    },
    {
      title: "Public boundary",
      body:
        "The site does not claim live commerce, prices, active vendors, inventory, transactions or endorsed products.",
    },
  ],
  kip: [
    {
      title: "Purpose",
      body:
        "KIP is a research-stage payments and support infrastructure concept that could later support giving, transactions, bookings or partner workflows if compliance requirements are met.",
    },
    {
      title: "Possible workflows",
      body:
        "Future workflows may include secure payment routing, wallet-style account views, partner transaction records, payment provider integration and finance-related support controls.",
    },
    {
      title: "Readiness requirements",
      body:
        "Payments require legal, banking, licensing, provider, fraud, identity, data-protection and operational review before any public processing claims.",
    },
    {
      title: "Public boundary",
      body:
        "The site does not claim payment licensing, stored-value capability, banking services, live processing or investment/financial advice.",
    },
  ],
  kih: [
    {
      title: "Purpose",
      body:
        "KIH is a research-stage health-support concept focused on possible care coordination, partner support and community assistance workflows.",
    },
    {
      title: "Possible workflows",
      body:
        "Future workflows may include care partner directories, appointment support, follow-up coordination, support groups, privacy-aware notes and operational dashboards.",
    },
    {
      title: "Readiness requirements",
      body:
        "Health-related work requires qualified partners, clinical/legal review, privacy controls, data retention rules, consent handling and careful public wording.",
    },
    {
      title: "Public boundary",
      body:
        "The site does not provide medical advice, diagnosis, treatment, emergency services, clinical claims or health-provider availability.",
    },
  ],
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
    fullName: "Kingdom Impact Market",
    stage: "planned",
    statusLabel: "Planned venture",
    summary:
      "KIM is planned as a marketplace venture connecting KCAN partners, vendors and communities for trade and commerce under KIV's wider mission.",
    audience: "Vendors, marketplace leaders, partners and KCAN communities.",
    details: [
      "No public user counts, licensing claims or release dates are stated.",
      "Marketplace workflows will be announced only after product and legal readiness.",
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
      "The public site now includes visual explainers for the KCAN, KIV and KIS relationship, the KIS ecosystem, staged venture portfolio, partner path, investor readiness, trust controls and availability states.",
      "The purpose of these additions is to let visitors understand the project visually before reading detailed copy, while keeping every claim tied to stage, evidence and configuration.",
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
      "KIS is described as an integrated ecosystem with profiles, social feed, messaging, groups, broadcasts, partner spaces, Bible/study workflows, events and marketplace foundations.",
      "The site also makes the public boundary clear: payment processing, health workflows, public store availability and verified partner claims require further review before they can be presented as live capabilities.",
    ],
  },
  {
    slug: "kiv-visual-information-expansion",
    title: "KIV expands public information and visual explainers",
    description:
      "The website now uses deeper content and generated explanatory images to make the KCAN, KIV and KIS story easier to understand.",
    date: "2026-07-29",
    sections: [
      "The latest website pass adds more detailed public explanations across the homepage, about page, mission page, product pages, partner page, investor page, download page, contact page, trust page and security page.",
      "Generated visuals now support the core story: KCAN is the parent mission body, KIV is the venture and technology arm, and KIS is the first flagship product in advanced launch preparation.",
      "Future ventures are also represented visually and textually: KIE for education, KIM for market, KIP for payments and KIH for health-support coordination. Each remains clearly marked as planned or research-stage where appropriate.",
      "The site continues to avoid unsupported claims such as fake partner logos, fake user counts, fake revenue, active store availability, payment licensing or medical service availability.",
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
      "General support is appropriate for public website questions, basic product-readiness questions and routing help. It is not the right place to submit passwords, private messages, recovery codes or sensitive personal records.",
      "Partner and investor conversations should use the dedicated routes because those requests may require different review, evidence and follow-up expectations.",
      "If a visitor is unsure which form to use, the safest starting point is the general contact route with only the minimum information needed to describe the request.",
    ],
  },
  {
    slug: "account-and-data-requests",
    title: "Account and data requests",
    description: "Where to begin account deletion and data deletion requests.",
    body: [
      "Account and data deletion pages explain what information is needed and what KIV must verify before actioning a request.",
      "The public website does not collect passwords, recovery codes or private credentials for deletion requests.",
      "Deletion requests may require identity or ownership verification before action is taken. This protects users from unauthorized deletion requests.",
      "Some records may be retained when required for security, legal compliance, dispute handling, abuse prevention or operational audit trails.",
      "Product-specific deletion workflows can be added later as KIS account systems and availability states become fully public.",
    ],
  },
  {
    slug: "kis-availability-and-launch-list",
    title: "KIS availability and launch list",
    description: "How to understand KIS coming-soon, launch-list, Android, iOS and web-app states.",
    body: [
      "KIS availability is controlled by configuration. If official Android, iOS or web-app URLs are not configured, the public site should not display fake download links.",
      "The launch list can collect interest before public app availability, but it should not imply that store delivery, onboarding or account access has already been released.",
      "When official links become available, the download page can show the correct platform-specific actions without rewriting the whole site.",
      "This approach keeps public communication honest and prevents visitors from being sent to unsupported or unofficial destinations.",
    ],
  },
  {
    slug: "trust-safety-and-public-claims",
    title: "Trust, safety and public claims",
    description: "Why KIV keeps some public claims limited even when product planning is broad.",
    body: [
      "KIV uses stage-aware public language because the overall vision includes social, education, market, payments and health-support directions with different risk levels.",
      "A feature can be part of the product strategy without being ready for public availability, public legal claims or partner-facing commitments.",
      "Payments, health, child safety, moderation, partner endorsements, investor materials and public metrics require review before they can be presented strongly on the website.",
      "The result is a site that explains the full project direction while separating current facts from future plans.",
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
