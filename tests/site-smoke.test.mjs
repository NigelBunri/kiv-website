import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const requiredRoutes = [
  "app/page.tsx",
  "app/about/page.tsx",
  "app/mission/page.tsx",
  "app/products/page.tsx",
  "app/products/kis/page.tsx",
  "app/products/kie/page.tsx",
  "app/products/kim/page.tsx",
  "app/products/kip/page.tsx",
  "app/products/kih/page.tsx",
  "app/partners/page.tsx",
  "app/investors/page.tsx",
  "app/updates/page.tsx",
  "app/updates/[slug]/page.tsx",
  "app/contact/page.tsx",
  "app/support/page.tsx",
  "app/support/[slug]/page.tsx",
  "app/download/page.tsx",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
  "app/acceptable-use/page.tsx",
  "app/community-guidelines/page.tsx",
  "app/security/page.tsx",
  "app/trust/page.tsx",
  "app/cookies/page.tsx",
  "app/child-safety/page.tsx",
  "app/email-policy/page.tsx",
  "app/account-deletion/page.tsx",
  "app/data-deletion/page.tsx",
];

test("all required route files exist", () => {
  for (const route of requiredRoutes) {
    assert.equal(existsSync(join(root, route)), true, `${route} should exist`);
  }
});

test("content avoids known placeholder language", () => {
  const source = readFileSync(join(root, "lib/site.ts"), "utf8") + readFileSync(join(root, "app/page.tsx"), "utf8");
  for (const phrase of ["Lorem ipsum", "1M users", "trusted by thousands", "award-winning"]) {
    assert.equal(source.includes(phrase), false, `${phrase} should not appear`);
  }
});

test("environment example separates public and server-only form secrets", () => {
  const env = readFileSync(join(root, ".env.example"), "utf8");
  assert.match(env, /NEXT_PUBLIC_KIS_ANDROID_AVAILABLE/);
  assert.match(env, /KIV_FORM_WEBHOOK_SECRET/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_.*SECRET/);
});


test("KIS availability environment matrix is represented in source", () => {
  const source = readFileSync(join(root, "lib/site.ts"), "utf8");
  const download = readFileSync(join(root, "app/download/page.tsx"), "utf8");
  const productPanel = readFileSync(join(root, "components/PageBlocks.tsx"), "utf8");

  for (const key of [
    "NEXT_PUBLIC_KIS_LAUNCH_LIST",
    "NEXT_PUBLIC_KIS_ANDROID_AVAILABLE",
    "NEXT_PUBLIC_KIS_IOS_AVAILABLE",
    "NEXT_PUBLIC_KIS_GOOGLE_PLAY_URL",
    "NEXT_PUBLIC_KIS_APP_STORE_URL",
    "NEXT_PUBLIC_KIS_WEB_APP_URL",
  ]) {
    assert.match(source, new RegExp(key));
  }

  assert.match(download, /Coming soon/);
  assert.match(download, /Google Play/);
  assert.match(download, /App Store/);
  assert.match(download, /Web app/);
  assert.match(productPanel, /Store links will appear here only after official release links are configured/);
  assert.match(productPanel, /rel="noopener noreferrer"/);
});

test("website login does not call the removed OTP endpoints (WEB-040/041)", () => {
  // Regression: this used to be a two-step SMS-OTP flow against
  // /api/v1/auth/otp/initiate/ + /api/v1/auth/otp/verify/ - neither
  // endpoint exists anymore in the Django backend (apps/otp/ has no
  // views.py/urls.py at all; OTP was removed as part of the KIS Google
  // Auth migration), so every website sign-in via phone number failed
  // 100% of the time. Login is now a single password-based call against
  // the real, current /api/v1/auth/login/ endpoint, matching how the
  // mobile app (src/screens/LoginScreen.tsx) already logs in.
  const loginRoute = readFileSync(join(root, "app/api/auth/login/route.ts"), "utf8");
  assert.doesNotMatch(loginRoute, /otp\/initiate/);
  assert.doesNotMatch(loginRoute, /otp\/verify/);
  assert.match(loginRoute, /\/api\/v1\/auth\/login\//);
  assert.equal(existsSync(join(root, "app/api/auth/verify/route.ts")), false, "the dead OTP verify route should be removed, not just unused");

  const loginForm = readFileSync(join(root, "components/LoginForm.tsx"), "utf8");
  assert.match(loginForm, /type="password"/);
  assert.doesNotMatch(loginForm, /one-time-code/);
});
