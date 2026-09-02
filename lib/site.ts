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
  // Public by design (a CAPTCHA site key is meant to ship to the browser -
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

// The "Seven Mountains of influence" framing - one pillar per area of
// everyday life the product architecture is designed to cover, unified
// under a single account rather than shipped as seven separate apps.
// Every bullet describes design scope (what KIS is built to bring
// together), not a live-availability claim - AvailabilityPanel is still
// the only place on this page that speaks to what's actually released.
export const kisPillars = [
  {
    icon: "✝",
    title: "Church & Faith",
    tagline: "Discipleship and worship as a first-class part of the product",
    features: [
      "Online giving, tithes and offerings",
      "Church membership directories and rosters",
      "Global prayer wall and prayer chains",
      "Bible reading, devotionals and study tools",
      "Live sermon and worship broadcasting",
      "Small-group and discipleship tracking",
    ],
  },
  {
    icon: "⌂",
    title: "Family",
    tagline: "Built for households, not just individual accounts",
    features: [
      "Family accounts and household profiles",
      "Parental controls and screen-time management",
      "Shared family devotionals and prayer",
      "Secure family video calls and chat",
      "Age-inclusive design from children to elders",
      "Family event calendars and milestones",
    ],
  },
  {
    icon: "🎓",
    title: "Education",
    tagline: "A learning marketplace, not just a course library",
    features: [
      "Courses, lessons and live virtual classrooms",
      "Institution management for schools and academies",
      "Enrolment, progress tracking and completion",
      "Reviews, questions and student-teacher channels",
      "Free and paid content in the same catalogue",
      "Scholarship and access-request workflows",
    ],
  },
  {
    icon: "⚖",
    title: "Governance & Community",
    tagline: "Structure for how partner communities are run",
    features: [
      "Role-based access control for every partner space",
      "Partner and organisation governance tools",
      "Moderation and content-safety workflows",
      "Audit trails for administrative actions",
      "Community and cell-group management",
    ],
  },
  {
    icon: "▶",
    title: "Media & Broadcasting",
    tagline: "A full creator and channel studio, built in",
    features: [
      "Channels for organisations, ministries and creators",
      "Live streaming, short-form video and replays",
      "Comments, reactions, clips and playlists",
      "Search, trending, categories and recommendations",
      "Notifications for new uploads and activity",
      "Watch history, queue and subscriptions",
    ],
  },
  {
    icon: "◧",
    title: "Business & Marketplace",
    tagline: "Commerce with a cart, checkout and real payment rails",
    features: [
      "Shop and product catalogues with galleries",
      "Cart, checkout and order management",
      "Stripe and Flutterwave payment processing",
      "Service bookings and provider scheduling",
      "Jobs board with in-app applications",
      "Shop team roles and payout accounts",
    ],
  },
  {
    icon: "✚",
    title: "Health",
    tagline: "A directory built for institutions that opt in",
    features: [
      "Health institution profiles and service listings",
      "Clinics, hospitals, labs, pharmacies and wellness centres",
      "Opt-in public visibility, not an open directory by default",
      "Service pricing and assessment requirements",
      "Institution membership and staff roles",
    ],
  },
];

// Framed as the global context KIS was designed to respond to - real,
// citable trends about the world, not claims about KIS's own current
// usage or reach. Deliberately does not repeat the audience/market-size
// projections from internal investor materials as bare stats on the
// public site; the trends themselves are the honest, defensible part.
export const kisWhyBuilt = [
  {
    title: "One login instead of seven subscriptions",
    body:
      "A single church or ministry today typically stitches together a messaging app, a video tool, a streaming service, a store, a course platform, a member directory and a giving app. KIS is architected so one account can replace that whole stack.",
  },
  {
    title: "Faith content treated as a first-class citizen",
    body:
      "General-purpose platforms treat faith and ministry content as one category among many, with moderation and monetisation rules built for a different kind of content entirely. KIS is designed around it from the ground up.",
  },
  {
    title: "Digital-first community is now permanent",
    body:
      "Hybrid gathering, remote study and online giving are no longer temporary workarounds - they are how communities now expect to operate day to day, alongside in-person life, not instead of it.",
  },
  {
    title: "Built for low-bandwidth and every age",
    body:
      "Offline-tolerant design, careful data usage and interfaces that work for a first-time smartphone user as well as a power user are treated as first principles in the product's architecture, not later accommodations.",
  },
  {
    title: "One account, seven areas of life",
    body:
      "Faith, family, learning, community governance, media, commerce and health are usually seven separate accounts, seven separate trust decisions, seven separate places to manage. KIS is built to make that one decision, once.",
  },
];

// Framed as designed product scope (what the architecture is built to
// include), matched against categories of general-purpose apps most
// people already use daily - not a claim that every cell is live in
// production today. AvailabilityPanel is the actual source of truth for
// release status.
export const kisComparisonColumns = ["KIS", "WhatsApp", "YouTube", "Facebook", "A typical church app"];

export const kisComparisonRows: Array<{ label: string; cells: Array<"yes" | "no" | string> }> = [
  {
    label: "Secure messaging & video calls",
    cells: ["yes", "yes", "no", "yes", "Partial"],
  },
  {
    label: "Live broadcasting & creator studio",
    cells: ["yes", "no", "yes", "Basic", "no"],
  },
  {
    label: "Full commerce: cart, checkout, payments",
    cells: ["yes", "no", "Merch only", "Basic", "no"],
  },
  {
    label: "Health institution directory",
    cells: ["yes", "no", "no", "no", "no"],
  },
  {
    label: "Education marketplace with enrolment",
    cells: ["yes", "no", "Basic courses", "no", "no"],
  },
  {
    label: "Bible & faith-first integration",
    cells: ["yes", "no", "no", "no", "Partial"],
  },
  {
    label: "Church & organisation management",
    cells: ["yes", "no", "no", "no", "Partial"],
  },
  {
    label: "White-label app builder for partners",
    cells: ["yes", "no", "no", "no", "no"],
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

// Deeper version of audienceSegments for /who-we-serve: each market pairs
// the real problem that group faces today with the specific KIS module
// that answers it (kisModules above), rather than a single summary line.
export const audienceDeepDives = [
  {
    title: "Individuals and families",
    problem:
      "Mainstream social apps are built to hold attention, not to build real community - leaving many people feeling more isolated, not less, and with nowhere purpose-built for faith growth alongside everyday connection.",
    solution:
      "KIS pairs purpose-led profiles and community discovery with private messaging and Bible/study workflows, so connection and discipleship live in the same trusted space instead of being split across apps that weren't built for either.",
    image: { src: "/images/kiv-segment-families-visual.jpg", alt: "A family connecting together, representing individuals and families seeking safer digital community." },
  },
  {
    title: "Churches and ministries",
    problem:
      "A typical ministry team runs on a patchwork of email, a group chat app, a social media page and printed bulletins - none of it built for the church, all of it one platform-policy change away from disappearing.",
    solution:
      "Broadcast publishing, group coordination and dedicated partner spaces give ministry teams one trusted channel for announcements, member communication and events, owned by the church rather than rented from a general-purpose platform.",
    image: { src: "/images/kiv-segment-churches-visual.jpg", alt: "A church community gathered together, representing churches and ministries coordinating members." },
  },
  {
    title: "Creators and teachers",
    problem:
      "Christian educators and creators publishing on generic social platforms compete against an algorithm tuned for outrage and entertainment, with no structure for the teaching relationship itself.",
    solution:
      "Channels, structured content and direct audience relationships let creators and teachers build a real following around their teaching, with Bible and study workflows as first-class content rather than a link out to somewhere else.",
    image: { src: "/images/kiv-segment-creators-visual.jpg", alt: "A teacher leading a study session, representing Christian creators and educators building structured content." },
  },
  {
    title: "Schools and training partners",
    problem:
      "Faith-aligned education partners often have no shared digital infrastructure for cohorts, mentoring and programme communication, and end up assembling one from tools built for neither education nor ministry.",
    solution:
      "Partner spaces and the planned KIE learning pathways give schools and training partners a foundation for cohort communication and mentoring inside the same trusted ecosystem their learners already use - staged behind formal programme review, not claimed before it's ready.",
    image: { src: "/images/kiv-segment-education-visual.jpg", alt: "Students in a learning cohort, representing schools and training partners." },
  },
  {
    title: "Marketplace and service partners",
    problem:
      "Vendors and local entrepreneurs in faith communities rarely have a trusted, community-aligned place to reach buyers - general marketplaces offer scale but no shared trust, and word-of-mouth alone doesn't scale.",
    solution:
      "Marketplace foundations connect vendors, entrepreneurs and local organizations to the same community they already serve, laying groundwork for commerce inside a trusted network rather than a disconnected storefront.",
    image: { src: "/images/kiv-segment-marketplace-visual.jpg", alt: "A local vendor at a market stall, representing marketplace and service partners." },
  },
  {
    title: "Care and support partners",
    problem:
      "Care coordination in under-resourced communities is often held together by phone trees and spreadsheets, with no privacy-aware digital tooling built for the sensitivity of the work.",
    solution:
      "Private groups and messaging give care and support partners a coordination space with privacy and safety review built in from the start, with deeper care-specific workflows staged behind the same compliance review as every KIH-aligned capability.",
    image: { src: "/images/kiv-contact-workflows-visual.jpg", alt: "A coordination and communication workflow, representing care and support partners routing requests to the right place." },
  },
];

// World-problem framing for /who-we-serve: broader than any one audience
// segment, each paired with the concrete KIS module (or safety/trust page)
// that answers it - so every claim traces back to something already
// documented elsewhere on the site, not a new promise invented for this
// page.
export const worldProblemsSolved = [
  {
    title: "Digital isolation dressed up as connection",
    body:
      "Most social platforms optimize for time-on-screen, not for real relationship - leaving people more connected to a feed than to a community. KIS builds around purpose-led profiles and community discovery instead of an engagement-maximizing algorithm.",
  },
  {
    title: "Faith formation has no home in mainstream apps",
    body:
      "Bible reading, study and discipleship are treated as something you do somewhere else, never as part of the app itself. KIS makes Bible and study workflows a first-class product area alongside social features, not an afterthought.",
  },
  {
    title: "Ministry communication is scattered across rented platforms",
    body:
      "Churches depend on email, group chats and social pages they don't own or control, each with its own policies and outages. KIS gives ministry teams broadcast publishing and partner spaces they control, purpose-built for the church rather than borrowed from a general platform.",
  },
  {
    title: "Community spaces aren't built with safety as a first principle",
    body:
      "Many online spaces bolt on moderation and child-safety after problems appear. KIS treats privacy, moderation and child safety as launch-critical requirements from the start - see the site's trust, child-safety and community-guidelines commitments.",
  },
  {
    title: "Faith-aligned commerce has no trusted home",
    body:
      "Local vendors and entrepreneurs in faith communities either sell through platforms with no shared trust, or rely on word-of-mouth alone. KIS's marketplace foundations connect vendors to the community they already serve, inside the same trusted ecosystem.",
  },
  {
    title: "Care coordination runs on phone trees and spreadsheets",
    body:
      "Support and care work in under-resourced communities is often held together by informal, non-private tooling. KIS's group and messaging foundations give care partners a privacy-aware coordination space, with deeper workflows staged behind compliance review.",
  },
  {
    title: "Education and mentoring lack a shared digital home",
    body:
      "Faith-aligned schools, mentors and training partners rarely have infrastructure built for both education and ministry at once. KIS partner spaces, and the planned KIE learning pathways, are designed to close that gap once formal programme review is complete.",
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

// description + previewImage feed the hover/focus mega-menu flyout
// (lib/useNavFlyout.tsx) that SiteShell's primary nav shares with the
// storefront/site-builder page nav - every tab gets the same hover
// preview, not just website-builder pages. Products leads (right after
// Home) rather than sitting mid-list: visitor feedback was that the
// actual product (KIS) was hard to find among the corporate/mission
// copy, so the one nav item that leads straight to it gets top billing.
export const nav = [
  {
    href: "/",
    label: "Home",
    description: "Where KCAN, KIV and the KIS flagship product all come together.",
    previewImage: "/images/kiv-structure-visual-800.jpg",
  },
  {
    href: "/products",
    label: "Products",
    description: "KIS, the flagship app, plus the staged KIE/KIM/KIP/KIH venture portfolio.",
    previewImage: "/images/kiv-portfolio-roadmap-800.jpg",
  },
  {
    href: "/who-we-serve",
    label: "Who We Serve",
    description: "The people KIS is built for, the real problems they face, and how KIS solves them.",
    previewImage: "/images/kiv-segment-families-visual-800.jpg",
  },
  {
    href: "/about",
    label: "About",
    description: "Who KIV is, how it operates, and how it answers to KCAN.",
    previewImage: "/images/kiv-structure-visual-800.jpg",
  },
  {
    href: "/mission",
    label: "Mission",
    description: "The mission and operating principles behind every KIV product decision.",
    previewImage: "/images/kiv-mission-visual-800.jpg",
  },
  {
    href: "/partners",
    label: "Partners",
    description: "How churches, ministries and organisations can partner with KIV and KIS.",
    previewImage: "/images/kiv-partners-visual-800.jpg",
  },
  {
    href: "/investors",
    label: "Investors",
    description: "Investor information for Kingdom Impact Ventures, without unsupported claims.",
    previewImage: "/images/kiv-investors-visual-800.jpg",
  },
  {
    href: "/updates",
    label: "Updates",
    description: "The latest public updates on KIS launch preparation and the wider portfolio.",
    previewImage: "/images/kiv-portfolio-roadmap-800.jpg",
  },
  {
    href: "/contact",
    label: "Contact",
    description: "The right way to reach KIV - support, partners, investors and security.",
    previewImage: "/images/kiv-contact-workflows-visual-800.jpg",
  },
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
