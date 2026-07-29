import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "kiv-website",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "unknown",
  });
}
