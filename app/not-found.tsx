import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="not-found">
        <div>
          <p className="eyebrow">Page not found</p>
          <h1>This KIV page is not available.</h1>
          <p>The route may have moved, or the content has not been published.</p>
          <Link className="button primary" href="/">Return home</Link>
        </div>
      </section>
    </SiteShell>
  );
}
