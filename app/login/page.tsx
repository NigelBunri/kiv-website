import { Suspense } from "react";
import { SiteShell } from "@/components/SiteShell";
import { LoginForm } from "@/components/LoginForm";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({
    title: "Sign in",
    description: "Sign in with your KIS account to manage your website or complete a purchase.",
    path: "/login",
    robots: { index: false, follow: false },
  });
}

export default function LoginPage() {
  return (
    <SiteShell>
      <section className="content-page">
        <article>
          <p className="eyebrow">Sign in</p>
          <h1>Sign in with KIS</h1>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </article>
      </section>
    </SiteShell>
  );
}
