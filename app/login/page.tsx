import { Suspense } from "react";
import { SiteShell } from "@/components/SiteShell";
import { AuthTabs } from "@/components/AuthTabs";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({
    title: "Sign in",
    description: "Sign in with your KIS account, or create a new one, to manage your website or complete a purchase.",
    path: "/login",
    robots: { index: false, follow: false },
  });
}

export default function LoginPage() {
  return (
    <SiteShell>
      <section className="content-page">
        <article>
          <p className="eyebrow">Account</p>
          <h1>Sign in or create an account</h1>
          <p className="form-note">
            One KIS account works everywhere — sign in here with the same phone number and password you use in the
            app, or create a new account and use it to log into the app too.
          </p>
          <Suspense fallback={null}>
            <AuthTabs />
          </Suspense>
        </article>
      </section>
    </SiteShell>
  );
}
