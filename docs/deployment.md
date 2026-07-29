# Deployment

## Vercel-compatible path

Set the production domain to `kingdomimpactventures.org`, add `www`, configure environment variables from `.env.example`, run the quality gates, then deploy through the selected provider.

## AWS/self-hosted path

Use the provided multi-stage `Dockerfile`. Run the website as a separate service/container from existing API and chat services. Do not merge it into backend processes.

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
