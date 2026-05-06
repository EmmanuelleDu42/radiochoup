import { z } from "zod";
import type { CoverArt } from "@/lib/types";
import { clientEnv } from "@/lib/env.client";
import { EXTERNAL_FETCH_TIMEOUT_MS } from "@/lib/constants";

const itunesResponseSchema = z.object({
  resultCount: z.number(),
  results: z.array(z.object({ artworkUrl100: z.string() }))
});

export async function searchItunesArtwork(params: {
  artist: string;
  song: string;
  cacheTtlS?: number;
}): Promise<string | null> {
  if (!params.artist || !params.song) return null;
  const term = encodeURIComponent(`${params.artist} ${params.song}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&limit=1`;
  try {
    const fetchOpts: RequestInit & { next?: { revalidate: number } } = {
      signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS)
    };
    if (params.cacheTtlS !== undefined) {
      (fetchOpts as { next: { revalidate: number } }).next = { revalidate: params.cacheTtlS };
    }
    const response = await fetch(url, fetchOpts);
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
  cacheTtlS?: number;
}): Promise<CoverArt> {
  const fallback = clientEnv.NEXT_PUBLIC_DEFAULT_COVER;
  const url = await searchItunesArtwork(params);
  if (!url) {
    return { url: fallback, source: "default", sizes: buildArtworkSizes(fallback) };
  }
  const sizes = buildArtworkSizes(url);
  return { url: sizes.s512, source: "itunes", sizes };
}
