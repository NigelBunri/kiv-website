"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="not-found">
      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1>The website could not load this view.</h1>
        <p>Please retry. If the issue continues, contact KIV support.</p>
        <button className="button primary" onClick={() => reset()}>Try again</button>
      </div>
    </main>
  );
}
