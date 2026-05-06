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

  const [artistRaw, songRaw] = splitTitle(source.title);
  if (songRaw === "") {
    return {
      artist: "",
      song: source.title.trim(),
      listeners: source.listeners,
      bitrate: source.bitrate
    };
  }
  const artist = artistRaw.split(";")[0]?.trim() ?? "";
  const song = songRaw.trim();

  return {
    artist,
    song,
    listeners: source.listeners,
    bitrate: source.bitrate
  };
}

function splitTitle(title: string): [string, string] {
  const idx = title.indexOf(" - ");
  if (idx === -1) return [title, ""];
  return [title.slice(0, idx), title.slice(idx + 3)];
}

function isIcecastStatus(value: unknown): value is IcecastStatus {
  return typeof value === "object" && value !== null && "icestats" in value;
}

export async function fetchIcecastStatus(statusUrl: string): Promise<ParsedNowPlaying | null> {
  const response = await fetch(statusUrl, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) return null;
  const data = await response.json();
  return parseIcecastStatus(data);
}
