import type { HistoryEntry } from "@/lib/types";

export class HistoryStore {
  private buffer: HistoryEntry[] = [];

  constructor(private readonly maxSize: number) {}

  push(entry: { artist: string; song: string }): boolean {
    const last = this.buffer[0];
    if (last && last.artist === entry.artist && last.song === entry.song) {
      return false;
    }
    this.buffer.unshift({ ...entry, playedAt: new Date().toISOString() });
    if (this.buffer.length > this.maxSize) {
      this.buffer.length = this.maxSize;
    }
    return true;
  }

  list(): HistoryEntry[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }
}

const globalForHistory = globalThis as unknown as { __historyStore?: HistoryStore };

export const historyStore =
  globalForHistory.__historyStore ?? new HistoryStore(20);
if (process.env.NODE_ENV !== "production") {
  globalForHistory.__historyStore = historyStore;
}
