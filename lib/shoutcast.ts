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

  const parts = stripped.split(",");
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

function splitTitle(title: string): [string, string] {
  const idx = title.indexOf(" - ");
  if (idx === -1) return [title, ""];
  return [title.slice(0, idx), title.slice(idx + 3)];
}

export async function fetchShoutcastStatus(streamUrl: string): Promise<ShoutcastNowPlaying | null> {
  const response = await fetch(`${streamUrl}/7.html`, {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0 RadioChoup/2.0" },
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) return null;
  const body = await response.text();
  return parseShoutcast7HtmlBody(body);
}
