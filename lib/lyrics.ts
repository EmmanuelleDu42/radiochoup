import "server-only";
import type { Lyrics } from "@/lib/types";
import { fetchLyrics as fetchVagalumeLyrics } from "@/lib/vagalume";
import { fetchLrclibLyrics } from "@/lib/lrclib";

/**
 * Lyrics orchestrator: tries Vagalume first (historical provider), then falls
 * back to lrclib.net when Vagalume returns nothing - which is currently the
 * case since Vagalume's public API is returning 503 across the board.
 * Each provider already fails silently, so a failure simply yields the next.
 */
export async function getLyrics(params: { artist: string; song: string }): Promise<Lyrics> {
  if (!params.artist || !params.song) {
    return { text: null, source: null, available: false };
  }
  const primary = await fetchVagalumeLyrics(params);
  if (primary.available) return primary;
  return fetchLrclibLyrics(params);
}
