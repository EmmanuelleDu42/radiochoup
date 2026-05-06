import { splitTitle } from "./parse-title";

export interface ShoutcastNowPlaying {
  streamingId: string;
  listenersMax: number;
  listenersPeak: number;
  listeners: number;
  bitrate: number;
  song: string;
  artist: string;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&ecirc;/g, "ê")
    .replace(/&agrave;/g, "à")
    .replace(/&acirc;/g, "â")
    .replace(/&ucirc;/g, "û")
    .replace(/&ccedil;/g, "ç")
    .replace(/&ocirc;/g, "ô")
    .replace(/&icirc;/g, "î")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
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
  const response = await fetch(`${streamUrl}/7.html`, {
    cache: "no-store",
    // Shoutcast servers commonly reject requests without a browser-like User-Agent (HTTP 403).
    headers: { "User-Agent": "Mozilla/5.0 RadioChoup/2.0" },
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) return null;
  const body = await response.text();
  return parseShoutcast7HtmlBody(body);
}
