# AWS SES production access readiness

Website URL: `https://kingdomimpactventures.org`

## KIV/KIS use case

KIV is the business and technology venture of KCAN. KIS is the first flagship product. Email use is transactional only.

## Public pages proving legitimacy

- `/`
- `/about`
- `/products/kis`
- `/privacy`
- `/terms`
- `/email-policy`
- `/security`
- `/account-deletion`
- `/data-deletion`

## Transactional email categories

| Category | Status |
| --- | --- |
| Verify email | Planned |
| Password reset | Planned |
| Login/security code | Planned |
| Security alert | Planned |
| Organisation invitation | Planned |
| Payment receipt placeholder | Planned; not active until payment compliance is verified |

## Consent and registration

Recipients should receive transactional email only after account, request, invitation or security actions. No purchased or scraped lists are allowed.

## Rate limits

OTP and password-reset limits are planned and must be verified in the backend before appeal submission.

## Bounce, complaint and suppression handling

Bounce and complaint handling is planned. Suppression-list status must be checked in AWS before appeal submission.

## SPF, DKIM, DMARC and MAIL FROM

| Item | Status |
| --- | --- |
| SPF | Planned |
| DKIM | Planned |
| DMARC | Planned |
| Custom MAIL FROM | Planned |

## Contact addresses

Support: `support@kingdomimpactventures.org`

Security: `security@kingdomimpactventures.org`

## Expected initial daily volume

Planned low-volume transactional launch. Confirm exact volume before appeal submission.

## Evidence checklist

- Public website screenshots.
- Privacy and email policy screenshots.
- Form-delivery test evidence.
- DNS authentication screenshots.
- Bounce/complaint configuration screenshots.
- Example templates.

AWS case ID: `TODO`

## Reconsideration response template

KIV requests reconsideration for SES production access for transactional email supporting account verification, password reset, login/security codes, security alerts and organisation invitations. The public website at `https://kingdomimpactventures.org` explains the organisation, product, privacy, terms, email policy, security contact and deletion process. KIV does not use purchased or scraped lists. Sending will begin at low volume after DNS authentication, bounce handling, complaint handling and rate limits are verified.

## Must be true before appeal

- DNS authentication verified.
- Bounce/complaint handling verified.
- Suppression behavior checked.
- Templates reviewed.
- Backend rate limits verified.
- Public pages live and screenshot evidence attached.
