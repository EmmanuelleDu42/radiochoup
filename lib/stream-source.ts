import "server-only";
import { getServerEnv } from "@/lib/env.server";
import { fetchIcecastStatus } from "@/lib/icecast";
import { fetchShoutcastStatus } from "@/lib/shoutcast";
import { historyStore } from "@/lib/history-store";
import { globalSingleton } from "@/lib/global-singleton";
import type { NowPlaying } from "@/lib/types";

type Subscriber = (data: NowPlaying) => void;

class StreamSource {
  private current: NowPlaying | null = null;
  private subscribers = new Set<Subscriber>();
  private timer: NodeJS.Timeout | null = null;

  start(): void {
    if (this.timer) return;
    void this.poll();
    this.timer = setInterval(() => void this.poll(), getServerEnv().NOW_PLAYING_POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getCurrent(): NowPlaying | null {
    return this.current;
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    if (this.current) fn(this.current);
    return () => {
      this.subscribers.delete(fn);
    };
  }

  private async poll(): Promise<void> {
    const env = getServerEnv();
    const parsed =
      env.STREAM_TYPE === "icecast"
        ? await fetchIcecastStatus(env.STREAM_STATUS_URL)
        : await fetchShoutcastStatus(env.STREAM_URL);

    if (!parsed) return;

    const next: NowPlaying = {
      song: parsed.song,
      artist: parsed.artist,
      listeners: parsed.listeners,
      bitrate: parsed.bitrate,
      fetchedAt: new Date().toISOString()
    };

    const changed =
      !this.current ||
      this.current.song !== next.song ||
      this.current.artist !== next.artist;

    this.current = next;

    if (changed) {
      historyStore.push({ artist: next.artist, song: next.song });
      this.subscribers.forEach((fn) => fn(next));
    }
  }
}

export const streamSource = globalSingleton("__streamSource", () => new StreamSource());
streamSource.start();
