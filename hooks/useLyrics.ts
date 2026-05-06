"use client";

import { useEffect, useState } from "react";
import type { Lyrics } from "@/lib/types";

export function useLyrics(params: { artist: string; song: string } | null): Lyrics {
  const [lyrics, setLyrics] = useState<Lyrics>({ text: null, source: null, available: false });

  useEffect(() => {
    if (!params?.artist || !params?.song) {
      setLyrics({ text: null, source: null, available: false });
      return;
    }
    const controller = new AbortController();
    const url = new URL("/api/lyrics", window.location.origin);
    url.searchParams.set("artist", params.artist);
    url.searchParams.set("song", params.song);

    fetch(url.toString(), { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { text: null, source: null, available: false }))
      .then((data: Lyrics) => setLyrics(data))
      .catch(() => setLyrics({ text: null, source: null, available: false }));

    return () => controller.abort();
  }, [params?.artist, params?.song]);

  return lyrics;
}
