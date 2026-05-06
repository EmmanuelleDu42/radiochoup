export type StreamType = "icecast" | "shoutcast";

export interface NowPlaying {
  song: string;
  artist: string;
  listeners: number | null;
  bitrate: number | null;
  fetchedAt: string; // ISO timestamp
}

export interface HistoryEntry {
  song: string;
  artist: string;
  playedAt: string; // ISO timestamp
}

export interface Lyrics {
  text: string | null;
  source: "vagalume" | null;
  available: boolean;
}

export interface CoverArt {
  url: string;
  source: "itunes" | "default";
  sizes: {
    s96: string;
    s128: string;
    s192: string;
    s256: string;
    s384: string;
    s512: string;
  };
}

export interface StreamEvent {
  type: "now-playing" | "history-updated";
  payload: NowPlaying | HistoryEntry[];
}
