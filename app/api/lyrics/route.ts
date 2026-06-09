import { NextResponse } from "next/server";
import { getLyrics } from "@/lib/lyrics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist") ?? "";
  const song = searchParams.get("song") ?? "";
  if (!artist || !song) {
    return NextResponse.json({ error: "artist and song are required" }, { status: 400 });
  }
  const lyrics = await getLyrics({ artist, song });
  return NextResponse.json(lyrics);
}
