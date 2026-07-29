# Forms and email

Public forms validate server-side, limit field lengths, include a honeypot and return honest delivery states. In-memory rate limiting is sufficient only for local/single-instance testing.

Production needs shared rate-limit persistence such as Redis, Durable Objects, WAF rules or provider-native protection. Use Reply-To with the user's email instead of placing unverified user input in From headers.
