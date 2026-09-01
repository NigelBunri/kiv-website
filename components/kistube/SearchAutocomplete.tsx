"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/kistube/icons";

type Suggestions = { channels: { id: string; handle: string; display_name: string }[]; contents: { id: string; title: string }[] };

// Self-contained search-as-you-type box the coordinator drops into the
// topbar - not wired into KISTubeShell.tsx directly by this pass.
export function SearchAutocomplete({ initialQuery = "", className = "" }: { initialQuery?: string; className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions(null);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/kistube/search-suggest?q=${encodeURIComponent(value)}`);
        const data = await res.json().catch(() => null);
        setSuggestions(data);
        setOpen(true);
      } catch {
        // ignore - suggestions are a convenience, not critical
      }
    }, 250);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/kistube/search?q=${encodeURIComponent(trimmed)}`);
  }

  const hasSuggestions = suggestions && (suggestions.channels.length > 0 || suggestions.contents.length > 0);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }} className={className}>
      <form className="kt-search-form" onSubmit={submit} role="search">
        <input
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => hasSuggestions && setOpen(true)}
          placeholder="Search KISTube"
          aria-label="Search KISTube"
        />
        <button type="submit" aria-label="Search"><SearchIcon /></button>
      </form>
      {open && hasSuggestions && (
        <div
          className="kt-profile-menu is-open"
          style={{ left: 0, right: 0, width: "auto", top: "calc(100% + .4rem)" }}
          role="listbox"
        >
          {suggestions!.channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              role="option"
              onClick={() => { setOpen(false); router.push(`/kistube/channel/${channel.handle}`); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: ".5rem .7rem", border: "none", background: "transparent", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: ".88rem" }}
            >
              <strong>{channel.display_name}</strong> <span className="kt-card-meta">@{channel.handle}</span>
            </button>
          ))}
          {suggestions!.contents.map((content) => (
            <button
              key={content.id}
              type="button"
              role="option"
              onClick={() => { setOpen(false); router.push(`/kistube/watch/${content.id}`); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: ".5rem .7rem", border: "none", background: "transparent", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: ".88rem" }}
            >
              {content.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
