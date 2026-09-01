import Link from "next/link";

export function KISTubeEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="kt-state">
      <div className="kt-state-title">{title}</div>
      <div className="kt-state-body">{body}</div>
    </div>
  );
}

export function KISTubeErrorState({ title = "Something went wrong", body }: { title?: string; body: string }) {
  return (
    <div className="kt-state">
      <div className="kt-state-title">{title}</div>
      <div className="kt-state-body">{body}</div>
    </div>
  );
}

export function KISTubeAuthGate({ next, body }: { next: string; body: string }) {
  return (
    <div className="kt-authgate">
      <p>{body}</p>
      <Link href={`/login?next=${encodeURIComponent(next)}`} className="kt-button kt-button--primary">Sign in</Link>
    </div>
  );
}

export function KISTubeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="kt-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="kt-card" key={i}>
          <div className="kt-card-thumb-wrap kt-skeleton" />
        </div>
      ))}
    </div>
  );
}
