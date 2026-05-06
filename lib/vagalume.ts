import "server-only";
import { z } from "zod";
import { getServerEnv } from "@/lib/env.server";
import type { Lyrics } from "@/lib/types";

const vagalumeResponseSchema = z.object({
  type: z.enum(["exact", "aprox", "notfound", "song_notfound"]),
  mus: z.array(z.object({ text: z.string() })).optional()
});

export async function fetchLyrics(params: {
  artist: string;
  song: string;
}): Promise<Lyrics> {
  if (!params.artist || !params.song) {
    return { text: null, source: null, available: false };
  }
  const url = new URL("https://api.vagalume.com.br/search.php");
  url.searchParams.set("apikey", getServerEnv().VAGALUME_API_KEY);
  url.searchParams.set("art", params.artist);
  url.searchParams.set("mus", params.song.toLowerCase());

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: getServerEnv().LYRICS_CACHE_TTL_S }
    });
    if (!response.ok) return { text: null, source: null, available: false };
    const raw = await response.json();
    const parsed = vagalumeResponseSchema.safeParse(raw);
    if (!parsed.success) return { text: null, source: null, available: false };
    if ((parsed.data.type === "exact" || parsed.data.type === "aprox") && parsed.data.mus?.[0]?.text) {
      return { text: parsed.data.mus[0].text, source: "vagalume", available: true };
    }
    return { text: null, source: null, available: false };
  } catch {
    // Silent fail by design: external API errors should not crash the app, the UI displays defaults.
    return { text: null, source: null, available: false };
  }
}
