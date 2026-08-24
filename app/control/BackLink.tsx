import Link from "next/link";

// Lightweight up-the-hierarchy nav for institution/shop-scoped pages -
// deliberately not a full breadcrumb trail with fetched entity names,
// which would mean adding a new institution/shop-name fetch to every
// nested list/detail page just to render a label. This solves the same
// "how do I get back" problem (confirmed gap: no nested page links to its
// parent, only the browser back button does) using only route params
// every page already has in scope.
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="control-back-link">
      ← {label}
    </Link>
  );
}
