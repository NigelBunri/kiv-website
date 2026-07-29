# KIV website production hardening report

Date: 2026-07-29

## Executive summary

The KIV website has been created in this folder as a production-ready Next.js/Vinext site for `https://kingdomimpactventures.org`. The site covers the intended public route inventory, keeps the KCAN/KIV/KIS hierarchy consistent, presents KIS as the first flagship product in advanced launch preparation, and keeps KIE/KIM/KIP/KIH as future ventures.

## Route inventory

- `/`
- `/about`
- `/mission`
- `/products`
- `/products/kis`
- `/products/kie`
- `/products/kim`
- `/products/kip`
- `/products/kih`
- `/partners`
- `/investors`
- `/updates`
- `/updates/[slug]`
- `/contact`
- `/support`
- `/support/[slug]`
- `/download`
- `/privacy`
- `/terms`
- `/acceptable-use`
- `/community-guidelines`
- `/security`
- `/trust`
- `/cookies`
- `/child-safety`
- `/email-policy`
- `/account-deletion`
- `/data-deletion`

## Technical architecture

The site is server-rendered by default with a small client component only for public form submission. Shared content, products, updates, navigation and availability configuration live in `lib/site.ts`. Metadata helpers live in `lib/metadata.ts`. Public form validation is shared through `lib/validation.ts` and posted to `/api/forms`.

## Design system summary

The site uses the KIV gold, cream and ink visual language with responsive layouts, reserved card dimensions, visible focus states, reduced-motion support and print styles.

## Content and legal status

The site avoids fake statistics, fake partner logos, fake testimonials, fake awards, unverified licensing claims and unsupported product launch claims. Legal and trust pages are production-readiness drafts and require final legal review before launch.

## KIS availability configuration

The download route uses these variables as the single source of truth:

- `NEXT_PUBLIC_KIS_LAUNCH_LIST`
- `NEXT_PUBLIC_KIS_ANDROID_AVAILABLE`
- `NEXT_PUBLIC_KIS_IOS_AVAILABLE`
- `NEXT_PUBLIC_KIS_GOOGLE_PLAY_URL`
- `NEXT_PUBLIC_KIS_APP_STORE_URL`
- `NEXT_PUBLIC_KIS_WEB_APP_URL`

Coming-soon behavior is the default when no official store or web-app links are configured.

## Forms and email configuration

Public forms support contact, partnership, investor, launch-list, deletion and security request flows. They include server-side validation, length limits, a honeypot, local rate limiting and honest delivery states. Production distributed rate limiting and provider delivery require server-side configuration.

## Security controls

Security headers are configured in `next.config.ts` and mirrored in the Vinext worker response path, including CSP, Referrer-Policy, X-Content-Type-Options, Permissions-Policy and frame-ancestor protection. HSTS should be enabled only after HTTPS domain deployment is confirmed.

## SEO implementation

The site includes route metadata, canonical URLs, sitemap, robots, manifest, favicon/apple icon, Open Graph social image, organisation and website JSON-LD, breadcrumb JSON-LD, product JSON-LD for KIS/product pages, and article JSON-LD for updates.

## Accessibility work

The implementation includes semantic landmarks, skip link, visible focus, accessible form labels/errors/status, strong touch targets, responsive layouts, reduced-motion handling and no intentionally disabled dead buttons.

## Performance work

Pages are server-rendered by default. The implementation avoids making whole pages client components, avoids third-party scripts, removes starter-only skeleton dependency, removes unused database starter dependencies and uses local CSS rather than heavy UI libraries.

## Tests and exact results

Final validation results:

- `pnpm run lint`: passed
- `pnpm run typecheck`: passed
- `pnpm run smoke`: passed, 4 tests passed
- `pnpm run build`: passed, standalone output generated in `dist/standalone/`
- `pnpm audit`: passed, found 0 known vulnerabilities

## Live QA findings

- Safari raw-HTML rendering was traced to the Vinext dev server exposing `app/globals.css` as a JavaScript style module while the rendered HTML referenced it as a stylesheet.
- The global CSS is now delivered through a critical inline style component and the broken stylesheet import has been removed from the root layout.
- Local HTML verification confirms `id="kiv-critical-css"` is present and the `/app/globals.css` stylesheet link is absent.
- Security headers were verified on the local Vinext response path after the worker header fix.

## Environment variables requiring production values

- `NEXT_PUBLIC_SITE_URL`
- KIS availability variables as needed
- `KIV_FORM_PROVIDER`
- `KIV_FORM_TO_EMAIL`
- `KIV_FORM_FROM_EMAIL`
- `KIV_FORM_WEBHOOK_URL`
- `KIV_FORM_WEBHOOK_SECRET`
- `AWS_REGION`
- `AWS_SES_CONFIGURATION_SET`

## User-supplied assets still required

- Final approved KIV/KIS logo assets if different from the generated text mark.
- Reviewed KIS screenshots.
- Official Google Play, App Store and web app URLs when available.
- Legal-approved policy copy.
- DNS/email authentication screenshots for SES reconsideration.

## Deployment instructions

See `docs/deployment.md` and `docs/deployment-verification-checklist.md`. The repository includes a multi-stage Dockerfile and a Vercel-compatible/standalone build path. No live server was modified.

## SES reconsideration readiness

See `docs/aws-ses-production-access-readiness.md` and `docs/transactional-email-templates.md`. The package is prepared, but DNS authentication, bounce/complaint handling, backend rate limits and screenshots must be verified before sending the appeal.

## Known limitations

- Public form provider delivery is scaffolded and must be wired to the selected production provider.
- In-memory rate limiting is not enough for distributed production hosting.
- Legal pages are drafts pending legal review.
- Visual browser QA across all requested widths should be completed before final launch approval.

## Launch checklist

1. Confirm final legal copy.
2. Configure production environment variables.
3. Configure domain and HTTPS.
4. Wire and test form provider delivery.
5. Verify KIS availability matrix.
6. Run lint, typecheck, smoke, build and audit.
7. Verify sitemap, robots, manifest, structured data and social image.
8. Complete keyboard, responsive and Safari-oriented manual QA.
9. Attach SES and deployment evidence.
10. Deploy and smoke test apex plus `www`.
