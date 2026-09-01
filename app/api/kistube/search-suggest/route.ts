import { NextRequest, NextResponse } from "next/server";
import { fetchSearchSuggestions } from "@/lib/kistube-api";

// Thin proxy so the Client Component autocomplete box can call a
// same-origin route (fetchSearchSuggestions itself is server-side only,
// unauthenticated, cache:"no-store").
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (q.trim().length < 2) return NextResponse.json({ channels: [], contents: [] });
  const data = await fetchSearchSuggestions(q);
  return NextResponse.json(data ?? { channels: [], contents: [] });
}
