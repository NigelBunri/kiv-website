import { fetchGeoRestriction } from "@/lib/kistube-api";

// Server Component, self-contained. Renders nothing unless a real
// restriction is configured for this content - real country-code
// enforcement (blocking playback by the viewer's actual location) isn't
// done here (no geo-IP lookup wired into this Next.js layer); this is a
// visible notice only, matching what data actually exists.
export async function GeoRestrictionNotice({ contentId }: { contentId: string }) {
  const restriction = await fetchGeoRestriction(contentId);
  if (!restriction || restriction.countries.length === 0) return null;

  const verb = restriction.restriction_type === "allow" ? "only available in" : "not available in";
  return (
    <div className="kt-state" style={{ padding: "1rem 1.25rem", textAlign: "left", alignItems: "flex-start" }}>
      <p className="kt-card-meta">
        This video is {verb}: {restriction.countries.join(", ")}
      </p>
    </div>
  );
}
