# Forms and email

Public forms validate server-side, limit field lengths, include a honeypot, verify a Cloudflare Turnstile CAPTCHA token when configured, and return honest delivery states. In-memory rate limiting is sufficient only for local/single-instance testing.

Validated, CAPTCHA-verified submissions are forwarded to a Google Sheet via a Google Apps Script webhook when `KIV_FORM_WEBHOOK_URL`/`KIV_FORM_WEBHOOK_SECRET` are configured. See `docs/forms-integration-setup.md` for exact setup steps for both the CAPTCHA and the sheet delivery.

Production needs shared rate-limit persistence such as Redis, Durable Objects, WAF rules or provider-native protection. Use Reply-To with the user's email instead of placing unverified user input in From headers.
