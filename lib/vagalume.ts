import "server-only";
import { getServerEnv } from "@/lib/env.server";
import type { Lyrics } from "@/lib/types";

interface VagalumeResponse {
  type: "exact" | "aprox" | "notfound" | "song_notfound";
  mus?: Array<{ text: string }>;
}

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
    const data: VagalumeResponse = await response.json();
    if ((data.type === "exact" || data.type === "aprox") && data.mus?.[0]?.text) {
      return { text: data.mus[0].text, source: "vagalume", available: true };
    }
    return { text: null, source: null, available: false };
  } catch {
    return { text: null, source: null, available: false };
  }
}
