import { z } from "zod";
import type { CoverArt } from "@/lib/types";
import { clientEnv } from "@/lib/env.client";

const itunesResponseSchema = z.object({
  resultCount: z.number(),
  results: z.array(z.object({ artworkUrl100: z.string() }))
});

export async function searchItunesArtwork(params: {
  artist: string;
  song: string;
}): Promise<string | null> {
  if (!params.artist || !params.song) return null;
  const term = encodeURIComponent(`${params.artist} ${params.song}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&limit=1`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const raw = await response.json();
    const parsed = itunesResponseSchema.safeParse(raw);
    if (!parsed.success) return null;
    if (parsed.data.resultCount === 0 || !parsed.data.results[0]) return null;
    return parsed.data.results[0].artworkUrl100;
  } catch {
    // Silent fail by design: external API errors should not crash the app, the UI displays defaults.
    return null;
  }
}

export function buildArtworkSizes(baseUrl: string): CoverArt["sizes"] {
  const itunesPattern = /(\d+)x\1bb/;
  const match = itunesPattern.exec(baseUrl);
  const replace = (size: string) =>
    match ? baseUrl.replace(itunesPattern, `${size}x${size}bb`) : baseUrl;

  return {
    s96: replace("96"),
    s128: replace("128"),
    s192: replace("192"),
    s256: replace("256"),
    s384: replace("384"),
    s512: replace("512")
  };
}

export async function getCoverArt(params: {
  artist: string;
  song: string;
}): Promise<CoverArt> {
  const fallback = clientEnv.NEXT_PUBLIC_DEFAULT_COVER;
  const url = await searchItunesArtwork(params);
  if (!url) {
    return { url: fallback, source: "default", sizes: buildArtworkSizes(fallback) };
  }
  const high = url.replace("100x100bb", "512x512bb");
  return { url: high, source: "itunes", sizes: buildArtworkSizes(high) };
}
