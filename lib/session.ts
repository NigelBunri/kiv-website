import { cookies } from "next/headers";
import crypto from "node:crypto";

// Server-only web session for the KIS Website Builder — the browser never
// sees a raw JWT. This module encrypts {access, refresh, deviceId, userId,
// accessExpiresAt} into one httpOnly cookie; every authenticated Django
// call happens server-side (a Route Handler or Server Component reads the
// cookie, attaches Authorization+X-Device-Id, calls Django directly) —
// server-to-server, so this never touches CORS, unlike a browser-JS bearer
// token would. Modeled on the existing app/api/payment-status/route.ts
// server-side-fetch pattern, extended with a session instead of a one-shot
// proxy call.
const COOKIE_NAME = "kis_session";
const ALGO = "aes-256-gcm";
const DEFAULT_KIS_API_BASE_URL = "https://api.kingdomimpactventures.org";

export type Session = {
  access: string;
  refresh: string;
  deviceId: string;
  userId: string;
  accessExpiresAt: number; // unix seconds, from the JWT's own `exp` claim
};

function apiBase(): string {
  return (process.env.KIS_API_BASE_URL || DEFAULT_KIS_API_BASE_URL).replace(/\/$/, "");
}

function encryptionKey(): Buffer {
  const secret = process.env.SESSION_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("SESSION_ENCRYPTION_SECRET is not configured — web login cannot issue sessions without it.");
  }
  // sha256 gives a stable 32-byte key regardless of the configured secret's
  // own length, which aes-256-gcm requires exactly.
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptSession(payload: Session): string {
  const key = encryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decryptSession(value: string): Session | null {
  try {
    const buf = Buffer.from(value, "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ALGO, encryptionKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as Session;
  } catch {
    return null;
  }
}

/** Decode a JWT's `exp` claim without verifying the signature — Django is
 * the only party that ever verifies these tokens; this is purely so the
 * website knows when to proactively refresh, never used for trust. */
function readJwtExpiry(accessToken: string): number {
  try {
    const payloadSegment = accessToken.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8"));
    return typeof payload.exp === "number" ? payload.exp : 0;
  } catch {
    return 0;
  }
}

export function buildSession(args: { access: string; refresh: string; deviceId: string; userId: string }): Session {
  return { ...args, accessExpiresAt: readJwtExpiry(args.access) };
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 90, // matches Django's REFRESH_TOKEN_LIFETIME default (90 days) — the access token itself is refreshed transparently well before it expires
};

/** Read-only — safe to call from Server Components. Never refreshes; a
 * near-expired access token is fine for "am I signed in" display purposes,
 * and any Route Handler that needs to actually call Django uses
 * getValidAccessToken() below, which does refresh. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decryptSession(raw);
}

/** Route Handlers only (needs to write the response's Set-Cookie header). */
export function setSessionCookie(response: Response, session: Session) {
  const encoded = encryptSession(session);
  // NextResponse extends Response with a typed .cookies helper, but this
  // module is also used from Server Actions where a plain Response may be
  // passed — feature-detect rather than importing NextResponse's type here.
  (response as unknown as { cookies: { set: (name: string, value: string, opts: typeof COOKIE_OPTIONS) => void } }).cookies.set(
    COOKIE_NAME, encoded, COOKIE_OPTIONS,
  );
}

export function clearSessionCookie(response: Response) {
  (response as unknown as { cookies: { delete: (name: string) => void } }).cookies.delete(COOKIE_NAME);
}

/**
 * For Route Handlers that need to call an authenticated Django endpoint.
 * Refreshes the access token server-side if it's within 2 minutes of
 * expiry, using Django's existing DeviceBoundTokenRefreshView (keyed on
 * the same device_id/token_version every mobile session already uses).
 * Returns both the headers to attach AND the (possibly refreshed) session
 * — the caller must re-set the cookie with the returned session if
 * `refreshed` is true, since only the caller holds the outgoing Response.
 */
export async function getValidSession(): Promise<{ session: Session; refreshed: boolean } | null> {
  const session = await getSession();
  if (!session) return null;

  const needsRefresh = session.accessExpiresAt - Math.floor(Date.now() / 1000) < 120;
  if (!needsRefresh) return { session, refreshed: false };

  try {
    const res = await fetch(`${apiBase()}/api/v1/auth/jwt/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Device-Id": session.deviceId },
      body: JSON.stringify({ refresh: session.refresh }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null; // refresh token itself expired/revoked — caller should treat as signed out
    const data = (await res.json()) as { access?: string; refresh?: string };
    if (!data.access) return null;
    const refreshedSession = buildSession({
      access: data.access,
      refresh: data.refresh || session.refresh,
      deviceId: session.deviceId,
      userId: session.userId,
    });
    return { session: refreshedSession, refreshed: true };
  } catch (error) {
    console.error("session: token refresh failed", error);
    return null;
  }
}

export function authHeaders(session: Session): HeadersInit {
  return { Authorization: `Bearer ${session.access}`, "X-Device-Id": session.deviceId };
}

export function newDeviceId(): string {
  return crypto.randomUUID();
}

export { apiBase as kisApiBase, COOKIE_NAME as SESSION_COOKIE_NAME };
