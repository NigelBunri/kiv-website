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
