# Deployment

## Cloudflare Workers path (primary)

Built via the official `@opennextjs/cloudflare` adapter (see `open-next.config.ts` and `wrangler.jsonc`, `name: kiv-website`).

1. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` must be present wherever the build runs — it's inlined into the client bundle at `next build` time, not read at request time.
2. Set server-only secrets (`TURNSTILE_SECRET_KEY`, form provider/email credentials, `REDIS_URL`, etc.) with `pnpm wrangler secret put <NAME>` — never in `wrangler.jsonc`'s `vars`, never in a committed `.env*` file.
3. `pnpm run preview` — builds and runs the Worker once locally against the real Workers runtime (via Miniflare), for a final check before deploying.
4. `pnpm run deploy` — builds and deploys to Cloudflare Workers.
5. Roll back with `wrangler rollback` (see `wrangler rollback --help`), or by re-running `pnpm run deploy` against a previous known-good commit.

Rate limiting on `/api/forms` falls back to an in-memory counter when `REDIS_URL` is unset. Because Workers can route a request to any isolate with no shared memory, that fallback is not an effective limit here — set `REDIS_URL` for this deployment target.

## Vercel-compatible path

Set the production domain to `kingdomimpactventures.org`, add `www`, configure environment variables from `.env.example`, run the quality gates, then deploy through the selected provider.

## AWS/self-hosted path

Use the provided multi-stage `Dockerfile`. Run the website as a separate service/container from existing API and chat services. Do not merge it into backend processes.

**Note:** `next.config.ts` no longer sets `output: "standalone"` (the Cloudflare/OpenNext path above requires the regular `.next` server build, not the pruned standalone one), so the `Dockerfile`'s `COPY --from=builder /app/.next/standalone ./` step needs `output: "standalone"` restored in a build variant before this path is usable again. Cloudflare Workers is the actively maintained deploy target; treat this path as needing that one change before use.

Example Nginx concept:

```nginx
server {
  server_name kingdomimpactventures.org www.kingdomimpactventures.org;

  location /_next/static/ {
    proxy_pass http://kiv_website:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location /api/health {
    proxy_pass http://kiv_website:3000;
  }

  location / {
    proxy_pass http://kiv_website:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
  }
}
```

TLS should be handled by the reverse proxy or load balancer. Roll back by switching the upstream image tag to the previous known-good build and reloading the proxy.
