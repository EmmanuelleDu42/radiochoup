import "server-only";
import { z } from "zod";
import { getServerEnv } from "@/lib/env.server";
import type { Lyrics } from "@/lib/types";
import { EXTERNAL_FETCH_TIMEOUT_MS } from "@/lib/constants";

// lrclib.net asks clients to identify themselves with an app name + link.
const LRCLIB_USER_AGENT = "RadioChoup (https://www.radiochoup.com)";

const UNAVAILABLE: Lyrics = { text: null, source: null, available: false };

const lrclibSearchSchema = z.array(
  z.object({
    plainLyrics: z.string().nullable().optional(),
    syncedLyrics: z.string().nullable().optional()
  })
);

/**
 * Fallback lyrics provider. lrclib.net is a free, key-less community database
 * exposing both plain and time-synced lyrics. We only consume plainLyrics here
 * to match the existing Lyrics contract.
 */
export async function fetchLrclibLyrics(params: {
  artist: string;
  song: string;
}): Promise<Lyrics> {
  if (!params.artist || !params.song) return UNAVAILABLE;

  const url = new URL("https://lrclib.net/api/search");
  url.searchParams.set("artist_name", params.artist);
  url.searchParams.set("track_name", params.song);

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS),
      headers: { "User-Agent": LRCLIB_USER_AGENT },
      next: { revalidate: getServerEnv().LYRICS_CACHE_TTL_S }
    });
    if (!response.ok) return UNAVAILABLE;
    const raw = await response.json();
    const parsed = lrclibSearchSchema.safeParse(raw);
    if (!parsed.success) return UNAVAILABLE;

    // search() is fuzzy and returns many candidates; pick the first one that
    // actually carries lyrics (instrumentals come back with empty plainLyrics).
    const match = parsed.data.find((r) => r.plainLyrics && r.plainLyrics.trim().length > 0);
    if (match?.plainLyrics) {
      return { text: match.plainLyrics, source: "lrclib", available: true };
    }
    return UNAVAILABLE;
  } catch {
    // Silent fail by design: external API errors should not crash the app, the UI displays defaults.
    return UNAVAILABLE;
  }
}
