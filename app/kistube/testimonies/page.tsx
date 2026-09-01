import type { Metadata } from "next";
import { fetchTestimonies, type TestimonyEntry } from "@/lib/kistube-api";
import { KISTubeEmptyState } from "@/components/kistube/KISTubeStates";
import { EndorseButton } from "@/components/kistube/EndorseButton";
import { getKisTubeSidebarData } from "@/lib/kistube-viewer";
import { formatRelativeTime } from "@/lib/kistube-format";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Testimonies",
  description: "Real stories shared by the KIS community.",
  path: "/kistube/testimonies",
  robots: kistubeRobots(),
});

const tileStyle = {
  border: "1px solid var(--line-soft)",
  borderRadius: "var(--radius-md)",
  background: "var(--surface)",
  padding: "1rem",
};

function excerpt(story: string, max = 180) {
  if (story.length <= max) return story;
  return `${story.slice(0, max).trimEnd()}…`;
}

function isImageMedia(mediaKind?: string) {
  if (!mediaKind) return false;
  return /image|photo|picture/i.test(mediaKind);
}

export default async function KISTubeTestimoniesPage() {
  const [testimonies, { viewer }] = await Promise.all([
    fetchTestimonies({ limit: 24 }),
    getKisTubeSidebarData(),
  ]);
  const results: TestimonyEntry[] = testimonies?.results ?? [];

  return (
    <div>
      <h1 className="kt-page-heading">Testimonies</h1>
      <p className="kt-page-subheading">Real stories shared by the KIS community.</p>

      {results.length === 0 ? (
        <KISTubeEmptyState title="No testimonies yet" body="Check back soon as members of the community share their stories." />
      ) : (
        <div className="kt-grid">
          {results.map((testimony) => (
            <div key={testimony.id} style={tileStyle}>
              {testimony.resource_url && isImageMedia(testimony.media_kind) ? (
                <div className="kt-card-thumb-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={testimony.resource_url} alt="" loading="lazy" />
                </div>
              ) : null}
              <span className="kt-filter-chip" style={{ cursor: "default", marginBottom: ".6rem", display: "inline-block" }}>
                {testimony.category}
              </span>
              <h3 className="kt-card-title">{testimony.title}</h3>
              <p className="kt-card-meta" style={{ marginBottom: ".85rem" }}>{excerpt(testimony.story)}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".5rem" }}>
                <span className="kt-card-meta">{formatRelativeTime(testimony.created_at)}</span>
                <EndorseButton
                  testimonyId={testimony.id}
                  initialCount={testimony.endorsement_count}
                  signedIn={viewer.signedIn}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
