import { NextRequest } from "next/server";
import { proxyToDjango } from "@/lib/controlProxy";

export async function GET(request: NextRequest) {
  return proxyToDjango(request, `/api/v1/broadcasts/user-playlists/${request.nextUrl.search}`, { method: "GET" });
}

export async function POST(request: NextRequest) {
  return proxyToDjango(request, "/api/v1/broadcasts/user-playlists/", { method: "POST" });
}
