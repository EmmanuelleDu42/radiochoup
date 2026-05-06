"use client";

import { useEffect, useState } from "react";
import type { NowPlaying } from "@/lib/types";

export function useNowPlaying(): { data: NowPlaying | null; connected: boolean } {
  const [data, setData] = useState<NowPlaying | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource("/api/stream-events");

    source.addEventListener("now-playing", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent<string>).data) as NowPlaying;
        setData(payload);
      } catch {
        // ignore malformed payload
      }
    });

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    return () => {
      source.close();
    };
  }, []);

  return { data, connected };
}
