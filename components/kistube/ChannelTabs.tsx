import Link from "next/link";

const TABS = [
  { value: "videos", label: "Videos" },
  { value: "playlists", label: "Playlists" },
  { value: "community", label: "Community" },
  { value: "about", label: "About" },
] as const;

// Self-contained presentational component - the coordinator reads the
// active tab from searchParams in the channel page itself and passes it
// in here, then conditionally renders the matching section below.
export function ChannelTabs({ handle, active }: { handle: string; active: string }) {
  return (
    <div className="kt-filter-row" style={{ marginBottom: "1.5rem" }}>
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          href={tab.value === "videos" ? `/kistube/channel/${handle}` : `/kistube/channel/${handle}?tab=${tab.value}`}
          className={`kt-filter-chip${active === tab.value ? " is-active" : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
