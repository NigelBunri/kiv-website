import type { Redis } from "ioredis";

const WINDOW_SECONDS = 15 * 60;
const LIMIT = 5;

// In-memory fallback. Correct only for a single long-running Node process
// (e.g. the Docker/AWS path in docs/deployment.md). On Cloudflare Workers,
// each request can land on a different isolate with its own empty Map, so
// this fallback stops being an effective limit there — set REDIS_URL in
// that deployment so rateLimitRedis below is used instead.
const submissions = new Map<string, { count: number; resetAt: number }>();

function rateLimitInMemory(key: string): boolean {
  const now = Date.now();
  const existing = submissions.get(key);
  if (!existing || existing.resetAt < now) {
    submissions.set(key, { count: 1, resetAt: now + WINDOW_SECONDS * 1000 });
    return true;
  }
  if (existing.count >= LIMIT) return false;
  existing.count += 1;
  return true;
}

let redisClient: Redis | null | undefined;

// Dynamically imported so the ioredis module (and its Node net/tls usage)
// is only ever loaded when REDIS_URL is actually set — it stays out of the
// Worker bundle's hot path entirely on deployments that don't configure it.
async function getRedisClient(): Promise<Redis | null> {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.REDIS_URL;
  if (!url) {
    redisClient = null;
    return redisClient;
  }
  const { Redis } = await import("ioredis");
  redisClient = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
  redisClient.on("error", (error) => console.error("Rate-limiter Redis connection error", error));
  return redisClient;
}

async function rateLimitRedis(client: Redis, key: string): Promise<boolean> {
  const redisKey = `ratelimit:${key}`;
  const count = await client.incr(redisKey);
  if (count === 1) {
    await client.expire(redisKey, WINDOW_SECONDS);
  }
  return count <= LIMIT;
}

/**
 * Fixed-window submission rate limit. Shared across replicas via Redis when
 * REDIS_URL is configured (needed once this site runs more than one
 * replica); otherwise falls back to the in-memory counter above, which is
 * already correct for a single-replica deployment. Fails open on Redis
 * errors — an availability safeguard must not become a new outage cause.
 */
export async function rateLimit(key: string): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) return rateLimitInMemory(key);

  try {
    return await rateLimitRedis(client, key);
  } catch (error) {
    console.error("Rate-limit check failed; failing open", error);
    return true;
  }
}
