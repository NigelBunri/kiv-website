import { Suspense } from "react";
import { SiteShell } from "@/components/SiteShell";
import { PairForm } from "@/components/PairForm";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({
    title: "Sign in with a code",
    description: "Sign in to KIS on this computer using the pairing code or link from your phone.",
    path: "/pair",
    robots: { index: false, follow: false },
  });
}

export default function PairPage() {
  return (
    <SiteShell>
      <section className="content-page">
        <article>
          <p className="eyebrow">Account</p>
          <h1>Sign in with a code</h1>
          <p className="form-note">
            Scanned a QR code from the app, or have a pairing code ready? Use it here to sign in on this computer.
          </p>
          <Suspense fallback={null}>
            <PairForm />
          </Suspense>
        </article>
      </section>
    </SiteShell>
  );
}
