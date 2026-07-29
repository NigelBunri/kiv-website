# Kingdom Impact Ventures website

This is the public Next.js website for Kingdom Impact Ventures at `https://kingdomimpactventures.org`.

KCAN, Kingdom Citizens & Ambassadors Network, is the parent organisation. KIV is the business and technology venture. KIS, Kingdom Impact Social, is the first flagship product. KIE, KIM, KIP and KIH are future ventures and must remain described at their configured stages until reviewed launch evidence changes.

## Local setup

Use Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

## Quality gates

```bash
npm run lint
npm run typecheck
npm run smoke
npm run build
npm audit
```

## Environment variables

Copy `.env.example` and set only the values needed for the current environment. `NEXT_PUBLIC_*` values are browser-visible. Never place AWS keys, webhook secrets, internal email destinations or private API credentials in public variables.

KIS availability is controlled through:

- `NEXT_PUBLIC_KIS_LAUNCH_LIST`
- `NEXT_PUBLIC_KIS_ANDROID_AVAILABLE`
- `NEXT_PUBLIC_KIS_IOS_AVAILABLE`
- `NEXT_PUBLIC_KIS_GOOGLE_PLAY_URL`
- `NEXT_PUBLIC_KIS_APP_STORE_URL`
- `NEXT_PUBLIC_KIS_WEB_APP_URL`

## Content editing

Core product, update, support and navigation content lives in `lib/site.ts`. Update copy there first, then run the quality gates. Do not add fake partner logos, unsupported statistics, fake testimonials, awards, licences, certifications or launched claims.

## Adding updates

Add a new entry to the `updates` array in `lib/site.ts`. The dynamic route at `/updates/[slug]` renders article metadata and structured data.

## Replacing KIS screenshots and store links

Place reviewed original screenshots in `public/` and reference them from native page components. Only enable Google Play, App Store or web app actions after official URLs are available and reviewed.

## Form provider setup

Public forms post to `/api/forms`. The current implementation validates input, limits field length, includes a honeypot and uses local in-memory rate limiting. Production distributed rate limiting should use shared storage or provider-native protection. Email/webhook delivery must remain server-side.

## Deployment options

The site can run on Vercel-compatible hosting or a self-hosted/AWS container. See `docs/deployment.md` for domain, Nginx, Docker, health-check and rollback details.

## Security considerations

Security headers are configured in `next.config.ts`. The CSP is intentionally conservative but still allows styles/scripts required by the framework. Re-test CSP after adding analytics, pixels, external media or form providers.

## Legal review requirements

The legal and trust routes are production-readiness drafts. They require legal review before final public launch, especially privacy, terms, acceptable use, child safety, email policy and deletion pages.

## Production launch checklist

1. Confirm domain and `www` DNS.
2. Configure reviewed production environment variables.
3. Run lint, typecheck, smoke tests, build and security audit.
4. Verify forms with the selected provider and no secret exposure.
5. Verify KIS availability matrix for coming-soon, Android, iOS and web states.
6. Review legal/trust pages.
7. Verify sitemap, robots, manifest, Open Graph and structured data.
8. Attach deployment, diagnostics, form-delivery and SES evidence.
9. Deploy.
10. Smoke test the live apex and `www` domains.
