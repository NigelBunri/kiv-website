import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchEducationContentDetail } from "@/lib/kistube-api";
import { EnrollButton } from "@/components/kistube/EnrollButton";
import { getKisTubeViewer } from "@/lib/kistube-viewer";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const content = await fetchEducationContentDetail(id);
  if (!content) return kistubeMetadata({ title: "Course", description: "KISTube education content.", path: `/kistube/education/${id}`, robots: { index: false, follow: false } });
  return kistubeMetadata({
    title: content.title,
    description: content.summary || content.description || `${content.title} on KISTube.`,
    path: `/kistube/education/${content.id}`,
    type: "article",
    image: content.coverUrl ? { url: content.coverUrl, width: 1200, height: 675, alt: content.title } : undefined,
    robots: kistubeRobots(false),
  });
}

function priceLabel(price?: { isFree: boolean; amountCents: number; currency: string }): string {
  if (!price) return "";
  if (price.isFree) return "Free";
  return `${(price.amountCents / 100).toFixed(2)} ${price.currency}`;
}

export default async function KISTubeEducationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [content, { viewer }] = await Promise.all([fetchEducationContentDetail(id), getKisTubeViewer()]);
  if (!content) notFound();

  return (
    <div className="kt-watch-layout">
      <div>
        <div className="kt-player-wrap" style={{ background: "var(--cream-2)" }}>
          {content.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.coverUrl} alt={content.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#fff" }}>{content.title}</div>
          )}
        </div>

        <h1 className="kt-watch-title">{content.title}</h1>

        <div className="kt-card-meta" style={{ marginBottom: ".5rem" }}>
          {content.partnerName}
          {content.language ? ` · ${content.language}` : ""}
          {content.level ? ` · ${content.level}` : ""}
          {content.durationMinutes ? ` · ${content.durationMinutes} min` : ""}
        </div>

        {content.reviewSummary && content.reviewSummary.reviewCount > 0 && (
          <div className="kt-card-meta" style={{ marginBottom: ".5rem" }}>{content.reviewSummary.label}</div>
        )}

        <div className="kt-card-meta" style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>{priceLabel(content.price)}</div>

        <div style={{ marginBottom: "1.5rem" }}>
          <EnrollButton
            contentId={content.id}
            signedIn={viewer.signedIn}
            initialCanEnroll={content.viewerState?.can_enroll ?? true}
            initialHasAccess={content.viewerState?.has_learning_access ?? false}
            isFree={content.price?.isFree ?? false}
          />
        </div>

        {(content.summary || content.description) && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 className="kt-related-heading">About this {content.type}</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{content.description || content.summary}</p>
          </div>
        )}

        {content.instructors && content.instructors.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 className="kt-related-heading">Instructors</h2>
            {content.instructors.map((instructor) => (
              <div key={instructor.id} className="kt-card-meta">{instructor.name} — {instructor.role}</div>
            ))}
          </div>
        )}

        {content.outcomes && content.outcomes.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 className="kt-related-heading">What you&rsquo;ll learn</h2>
            <ul>
              {content.outcomes.map((outcome) => (
                <li key={outcome.id}>{outcome.label}</li>
              ))}
            </ul>
          </div>
        )}

        <Link href={`/kistube/education`} style={{ fontSize: ".85rem" }}>← Back to Education</Link>
      </div>
    </div>
  );
}
