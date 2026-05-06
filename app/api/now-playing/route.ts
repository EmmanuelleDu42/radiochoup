import { NextResponse } from "next/server";
import { streamSource } from "@/lib/stream-source";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const data = streamSource.getCurrent();
  if (!data) {
    return NextResponse.json({ error: "Not yet available" }, { status: 503 });
  }
  return NextResponse.json(data);
}
