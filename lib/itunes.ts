import type { CoverArt } from "@/lib/types";
import { clientEnv } from "@/lib/env.client";

interface ItunesResult {
  artworkUrl100: string;
}

interface ItunesResponse {
  resultCount: number;
  results: ItunesResult[];
}

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
    const data: ItunesResponse = await response.json();
    if (data.resultCount === 0 || !data.results[0]) return null;
    return data.results[0].artworkUrl100;
  } catch {
    return null;
  }
}

export function buildArtworkSizes(baseUrl: string): CoverArt["sizes"] {
  const has100 = baseUrl.includes("100x100bb");
  const replace = (size: string) =>
    has100 ? baseUrl.replace("100x100bb", `${size}x${size}bb`) : baseUrl;

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
