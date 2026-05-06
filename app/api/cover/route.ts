import { NextResponse } from "next/server";
import { getCoverArt } from "@/lib/itunes";
import { getServerEnv } from "@/lib/env.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist") ?? "";
  const song = searchParams.get("song") ?? "";
  if (!artist || !song) {
    return NextResponse.json({ error: "artist and song are required" }, { status: 400 });
  }
  const cover = await getCoverArt({
    artist,
    song,
    cacheTtlS: getServerEnv().ITUNES_CACHE_TTL_S
  });
  return NextResponse.json(cover);
}
