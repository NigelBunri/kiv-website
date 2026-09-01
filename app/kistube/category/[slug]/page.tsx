import type { Metadata } from "next";
import Link from "next/link";
import { fetchCategoryBrowse, fetchChannelCategories } from "@/lib/kistube-api";
import { ContentCard } from "@/components/kistube/ContentCard";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

function titleCase(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = titleCase(slug);
  return kistubeMetadata({
    title,
    description: `Browse ${title} content on KISTube.`,
    path: `/kistube/category/${slug}`,
    robots: kistubeRobots(),
  });
}

export default async function KISTubeCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [browse, categories] = await Promise.all([fetchCategoryBrowse(slug, { page }), fetchChannelCategories()]);
  const matched = categories.find((c) => c.slug === slug);
  const title = matched?.name ?? titleCase(slug);
  const results = browse?.results ?? [];
  const totalPages = browse ? Math.max(1, Math.ceil(browse.count / browse.page_size)) : 1;

  return (
    <div>
      <h1 className="kt-page-heading">{title}</h1>
      <p className="kt-page-subheading">
        {matched?.description || `Content on KISTube matching "${title}".`} <Link href="/kistube/categories">All categories →</Link>
      </p>

      {results.length === 0 ? (
        <KISTubeEmptyState title="Nothing here yet" body={`No content matched the "${title}" category yet.`} />
      ) : (
        <>
          <div className="kt-grid">
            {results.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="kt-filter-row" style={{ marginTop: "1.5rem" }}>
              {page > 1 && <Link href={`/kistube/category/${slug}?page=${page - 1}`} className="kt-filter-chip">← Previous</Link>}
              <span className="kt-card-meta" style={{ alignSelf: "center" }}>Page {page} of {totalPages}</span>
              {page < totalPages && <Link href={`/kistube/category/${slug}?page=${page + 1}`} className="kt-filter-chip">Next →</Link>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
