import { splitTitle, decodeHtmlEntities } from "./parse-title";
import { EXTERNAL_FETCH_TIMEOUT_MS } from "./constants";

export interface ShoutcastNowPlaying {
  streamingId: string;
  listenersMax: number;
  listenersPeak: number;
  listeners: number;
  bitrate: number;
  song: string;
  artist: string;
}

export function parseShoutcast7HtmlBody(body: string): ShoutcastNowPlaying | null {
  if (!body) return null;
  const stripped = body.replace(/<\/?[a-z][^>]*>/gi, "").trim();
  if (!stripped) return null;
  const decoded = decodeHtmlEntities(stripped);

  const parts = decoded.split(",");
  if (parts.length < 7) return null;

  const titleParts = parts.slice(6).join(",");
  const [artistRaw = "", songRaw = ""] = splitTitle(titleParts);

  return {
    streamingId: parts[0] ?? "",
    listenersMax: Number(parts[2] ?? 0),
    listenersPeak: Number(parts[3] ?? 0),
    listeners: Number(parts[4] ?? 0),
    bitrate: Number(parts[5] ?? 0),
    artist: artistRaw.trim(),
    song: songRaw.trim() || titleParts.trim()
  };
}

export async function fetchShoutcastStatus(streamUrl: string): Promise<ShoutcastNowPlaying | null> {
  try {
    const response = await fetch(`${streamUrl}/7.html`, {
      cache: "no-store",
      // Shoutcast servers commonly reject requests without a browser-like User-Agent (HTTP 403).
      headers: { "User-Agent": "Mozilla/5.0 RadioChoup/2.0" },
      signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS)
    });
    if (!response.ok) return null;
    const buf = await response.arrayBuffer();
    const body = decodeWithFallback(buf);
    return parseShoutcast7HtmlBody(body);
  } catch {
    // Silent fail by design: external API errors should not crash the poll loop.
    return null;
  }
}

function decodeWithFallback(buf: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder("windows-1252").decode(buf);
  }
}
