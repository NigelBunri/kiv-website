import type { Metadata } from "next";
import Link from "next/link";
import { fetchChannelCategories } from "@/lib/kistube-api";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Categories",
  description: "Browse KISTube by category — education, health, market, ministry, music and more.",
  path: "/kistube/categories",
  robots: kistubeRobots(),
});

export default async function KISTubeCategoriesPage() {
  const categories = await fetchChannelCategories();

  return (
    <div>
      <h1 className="kt-page-heading">Categories</h1>
      <p className="kt-page-subheading">Browse KISTube content by category.</p>

      {categories.length === 0 ? (
        <KISTubeEmptyState title="No categories yet" body="Check back soon." />
      ) : (
        <div className="kt-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/kistube/category/${category.slug}`}
              className="kt-channel-card"
              style={{ textAlign: "left", alignItems: "flex-start" }}
            >
              <span className="kt-channel-card-name">{category.name}</span>
              {category.description && <span className="kt-channel-card-meta">{category.description}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
