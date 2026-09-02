import type { Metadata } from "next";
import Link from "next/link";
import { authHeaders, getValidSession, kisApiBase } from "@/lib/session";
import { getKisTubeViewer } from "@/lib/kistube-viewer";
import { KISTubeEmptyState, KISTubeErrorState } from "@/components/kistube/KISTubeStates";
import { kistubeMetadata, kistubeRobots } from "@/lib/kistube-metadata";

export const revalidate = 0;

export const metadata: Metadata = kistubeMetadata({
  title: "Education",
  description: "Courses, lessons, programs and workshops from KIS education institutions.",
  path: "/kistube/education",
  robots: kistubeRobots(),
});

// EducationDiscoveryView (apps.broadcasts) is a large, polymorphic
// discovery payload we haven't traced field-by-field beyond what this page
// actually renders — an index signature keeps unknown extra fields legal
// without pretending to model them.
type EducationPrice = { isFree: boolean; amountCents: number; currency: string };

type EducationItem = {
  id: string;
  type: string;
  title: string;
  summary?: string;
  coverUrl?: string;
  partnerId?: string;
  partnerName?: string;
  language?: string;
  level?: string;
  durationMinutes?: number;
  price?: EducationPrice;
  [key: string]: unknown;
};

type EducationSection = { id: string; title: string; type: string; items: EducationItem[] };

type EducationDiscoveryResponse = {
  hero_course: EducationItem | null;
  sections: EducationSection[];
  categories: { id: string; label: string }[];
  institution_spotlights: unknown[];
  continue_learning: unknown[];
  filters: { languages: string[]; levels: string[] };
};

// EducationDiscoveryView is now AllowAny (was IsAuthenticated) - attach
// auth headers only when a session exists, same as e.g. the comments GET
// route, so viewerState/enrollment fields still resolve correctly for a
// signed-in visitor while anonymous browsing keeps working.
async function fetchEducationDiscovery(): Promise<EducationDiscoveryResponse | null | "error"> {
  const auth = await getValidSession();
  try {
    const res = await fetch(`${kisApiBase()}/api/v1/education/discovery/`, {
      headers: auth ? authHeaders(auth.session) : {},
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return "error";
    return (await res.json()) as EducationDiscoveryResponse;
  } catch (error) {
    console.error("kistube education: discovery fetch failed", error);
    return "error";
  }
}

function priceBadge(price?: EducationPrice): string {
  if (!price) return "";
  if (price.isFree) return "Free";
  const amount = (price.amountCents ?? 0) / 100;
  return `${amount.toFixed(2)} ${price.currency || ""}`.trim();
}

function EducationTile({ item }: { item: EducationItem }) {
  return (
    <Link href={`/kistube/education/${item.id}`} className="kt-card" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="kt-card-thumb-wrap">
        {item.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverUrl} alt="" loading="lazy" />
        ) : (
          <div className="kt-card-thumb-placeholder">{item.partnerName || item.title}</div>
        )}
      </div>
      <div className="kt-card-body">
        <div style={{ flex: 1 }}>
          <h3 className="kt-card-title">{item.title}</h3>
          <div className="kt-card-meta">{item.partnerName}</div>
          <div className="kt-card-meta">
            {priceBadge(item.price)}
            {priceBadge(item.price) && item.durationMinutes ? " · " : null}
            {item.durationMinutes ? `${item.durationMinutes} min` : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function KISTubeEducationPage() {
  // Browsing no longer requires sign-in (EducationDiscoveryView is AllowAny
  // now) - viewer is still fetched since section tiles/enroll buttons want
  // to know signedIn state, same as Market/Health.
  const { viewer } = await getKisTubeViewer();
  const discovery = await fetchEducationDiscovery();

  return (
    <div>
      <h1 className="kt-page-heading">Education</h1>
      <p className="kt-page-subheading">Courses, lessons, programs and workshops from KIS education institutions.</p>

      {discovery === "error" && (
        <KISTubeErrorState body="Unable to load education content right now. Please try again shortly." />
      )}

      {discovery && discovery !== "error" && (
        <>
          {discovery.hero_course && (
            <section
              style={{
                display: "flex",
                gap: "1.5rem",
                alignItems: "center",
                marginBottom: "2.5rem",
                padding: "1.5rem",
                borderRadius: "var(--radius-md)",
                background: "var(--cream-2)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ width: 260, aspectRatio: "16 / 9", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--cream)", flexShrink: 0 }}>
                {discovery.hero_course.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={discovery.hero_course.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>
              <div>
                <h2 className="kt-related-heading" style={{ marginBottom: ".4rem" }}>{discovery.hero_course.title}</h2>
                <div className="kt-card-meta">{discovery.hero_course.partnerName}</div>
              </div>
            </section>
          )}

          {discovery.sections.length === 0 ? (
            <KISTubeEmptyState
              title="No education content yet"
              body="Institutions will publish courses, lessons and workshops here as they become available."
            />
          ) : (
            discovery.sections.map((section) => (
              <section key={section.id} style={{ marginBottom: "2.5rem" }}>
                <h2 className="kt-related-heading">{section.title}</h2>
                {section.items.length === 0 ? (
                  <p className="kt-page-subheading">Nothing here yet.</p>
                ) : (
                  <div className="kt-grid">
                    {section.items.map((item) => (
                      <EducationTile key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}
