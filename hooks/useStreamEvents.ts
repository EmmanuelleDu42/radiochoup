"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import type { NowPlaying, HistoryEntry } from "@/lib/types";

const nowPlayingSchema = z.object({
  song: z.string(),
  artist: z.string(),
  listeners: z.number().nullable(),
  bitrate: z.number().nullable(),
  fetchedAt: z.string()
});

const historyEntrySchema = z.object({
  song: z.string(),
  artist: z.string(),
  playedAt: z.string()
});

const historySchema = z.array(historyEntrySchema);

interface State {
  nowPlaying: NowPlaying | null;
  history: HistoryEntry[];
  connected: boolean;
}

let source: EventSource | null = null;
let refCount = 0;
const listeners = new Set<(state: State) => void>();
let currentState: State = { nowPlaying: null, history: [], connected: false };

function notify() {
  listeners.forEach((fn) => fn(currentState));
}

function ensureConnection() {
  if (source) return;
  source = new EventSource("/api/stream-events");
  source.addEventListener("now-playing", (event) => {
    try {
      const parsed = nowPlayingSchema.safeParse(JSON.parse((event as MessageEvent<string>).data));
      if (!parsed.success) return;
      const next = parsed.data;
      if (
        currentState.nowPlaying &&
        currentState.nowPlaying.song === next.song &&
        currentState.nowPlaying.artist === next.artist
      ) {
        return;
      }
      currentState = { ...currentState, nowPlaying: next };
      notify();
    } catch {
      // ignore malformed payload
    }
  });
  source.addEventListener("history-updated", (event) => {
    try {
      const parsed = historySchema.safeParse(JSON.parse((event as MessageEvent<string>).data));
      if (!parsed.success) return;
      currentState = { ...currentState, history: parsed.data };
      notify();
    } catch {
      // ignore
    }
  });
  source.onopen = () => {
    currentState = { ...currentState, connected: true };
    notify();
  };
  source.onerror = () => {
    currentState = { ...currentState, connected: false };
    notify();
  };
}

function teardownConnection() {
  if (source) {
    source.close();
    source = null;
  }
}

export function useStreamEvents(): State {
  const [state, setState] = useState<State>(currentState);

  useEffect(() => {
    refCount++;
    ensureConnection();
    listeners.add(setState);
    setState(currentState);
    return () => {
      listeners.delete(setState);
      refCount--;
      if (refCount === 0) teardownConnection();
    };
  }, []);

  return state;
}
