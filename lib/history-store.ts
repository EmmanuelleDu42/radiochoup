import type { HistoryEntry } from "@/lib/types";
import { globalSingleton } from "./global-singleton";

export class HistoryStore {
  private buffer: HistoryEntry[] = [];

  constructor(private readonly maxSize: number) {}

  /** Returns true if the entry was new and added, false if it duplicated the latest. */
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

export const historyStore = globalSingleton("__historyStore", () => new HistoryStore(20));
