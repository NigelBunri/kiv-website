import type { Metadata } from "next";
import Link from "next/link";
import { searchBroadcastContent } from "@/lib/kistube-api";
import { ContentCard } from "@/components/kistube/ContentCard";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Search",
  description: "Search videos, live streams and content across KISTube.",
  path: "/kistube/search",
  robots: kistubeRobots(),
});

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "video", label: "Videos" },
  { value: "live_stream", label: "Live" },
  { value: "image", label: "Images" },
] as const;

function pageHref(q: string, type: string | undefined, page: number) {
  const params = new URLSearchParams();
  params.set("q", q);
  if (type) params.set("type", type);
  if (page > 1) params.set("page", String(page));
  return `/kistube/search?${params.toString()}`;
}

export default async function KISTubeSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const { q, type, page: pageParam } = await searchParams;
  const query = (q || "").trim();
  const page = Math.max(1, Number(pageParam) || 1);

  return (
    <div>
      <h1 className="kt-page-heading">Search</h1>
      <p className="kt-page-subheading">Search videos, live streams and content across KISTube.</p>

      <form className="kt-search-form" style={{ maxWidth: 420, marginBottom: "1.25rem" }} role="search">
        <input type="search" name="q" defaultValue={q} placeholder="Search KISTube" aria-label="Search KISTube" />
        {type && <input type="hidden" name="type" value={type} />}
        <button type="submit">Search</button>
      </form>

      {!query ? (
        <KISTubeEmptyState
          title="Search KISTube"
          body="Enter a search term above to find videos, live streams and more from across the KIS community."
        />
      ) : (
        <SearchResults q={query} type={type} page={page} />
      )}
    </div>
  );
}

async function SearchResults({ q, type, page }: { q: string; type?: string; page: number }) {
  const results = await searchBroadcastContent({ q, type, page });

  return (
    <>
      <div className="kt-filter-row">
        {TYPE_FILTERS.map((filter) => (
          <Link
            key={filter.value || "all"}
            href={pageHref(q, filter.value || undefined, 1)}
            className={`kt-filter-chip${(type || "") === filter.value ? " is-active" : ""}`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {!results || results.results.length === 0 ? (
        <KISTubeEmptyState title="No results" body={`No content matched "${q}". Try a different search term.`} />
      ) : (
        <>
          <div className="kt-grid">
            {results.results.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
          <Pager q={q} type={type} page={results.page} pageSize={results.page_size} count={results.count} />
        </>
      )}
    </>
  );
}

function Pager({
  q, type, page, pageSize, count,
}: {
  q: string; type?: string; page: number; pageSize: number; count: number;
}) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  if (totalPages <= 1) return null;
  return (
    <div className="kt-filter-row" style={{ marginTop: "1.5rem" }}>
      {page > 1 && <Link href={pageHref(q, type, page - 1)} className="kt-filter-chip">← Previous</Link>}
      <span className="kt-card-meta" style={{ alignSelf: "center" }}>Page {page} of {totalPages}</span>
      {page < totalPages && <Link href={pageHref(q, type, page + 1)} className="kt-filter-chip">Next →</Link>}
    </div>
  );
}
