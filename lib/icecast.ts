import { splitTitle, decodeHtmlEntities } from "./parse-title";
import { EXTERNAL_FETCH_TIMEOUT_MS } from "./constants";

interface IcecastSource {
  title: string;
  listener_peak: number;
  listeners: number;
  bitrate: number;
}

interface IcecastStatus {
  icestats: {
    source?: IcecastSource | IcecastSource[];
  };
}

export interface ParsedNowPlaying {
  song: string;
  artist: string;
  listeners: number;
  bitrate: number;
}

export function parseIcecastStatus(raw: unknown): ParsedNowPlaying | null {
  if (!isIcecastStatus(raw)) return null;
  const sourceRaw = raw.icestats.source;
  if (!sourceRaw) return null;
  const source = Array.isArray(sourceRaw) ? sourceRaw[0] : sourceRaw;
  if (!source || typeof source.title !== "string") return null;

  const listeners = typeof source.listeners === "number" ? source.listeners : 0;
  const bitrate = typeof source.bitrate === "number" ? source.bitrate : 0;

  const decoded = decodeHtmlEntities(source.title);
  const [artistRaw, songRaw] = splitTitle(decoded);
  if (songRaw === "") {
    return {
      artist: "",
      song: decoded.trim(),
      listeners,
      bitrate
    };
  }
  const artist = artistRaw.split(";")[0]?.trim() ?? "";
  const song = songRaw.trim();

  return {
    artist,
    song,
    listeners,
    bitrate
  };
}

function isIcecastStatus(value: unknown): value is IcecastStatus {
  return typeof value === "object" && value !== null && "icestats" in value;
}

export async function fetchIcecastStatus(statusUrl: string): Promise<ParsedNowPlaying | null> {
  try {
    const response = await fetch(statusUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS)
    });
    if (!response.ok) return null;
    const buf = await response.arrayBuffer();
    const text = decodeWithFallback(buf);
    const data = JSON.parse(text);
    return parseIcecastStatus(data);
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
